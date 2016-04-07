var Snoocore  = require('snoocore');
var fivebeans = require('fivebeans');
var Config    = require('./config');

var reddit = new Snoocore({
    userAgent: Config.reddit.userAgent,
    oauth: {
        type: 'script',
        key: Config.reddit.oauth.key,
        secret: Config.reddit.oauth.secret,
        username: Config.reddit.oauth.username,
        password: Config.reddit.oauth.password,
        scope: [ 'identity', 'read', 'vote', 'edit', 'modconfig', 'submit' ]
    }
});

var bean = new fivebeans.client(Config.beanstalkd.host, Config.beanstalkd.port);
bean.on('connect', function() {
    bean.watch(Config.beanstalkd.tube, function(err) {
        if (err) {
            throw err;
        }
        
        reserveQueued();
        setInterval(reserveQueued, 60000);
    });
});
bean.on('error', function(err) {
    throw err;
});
bean.connect();

function buildComment(payload) {
    var text = payload.media.title + "\r\n\r\n";
    if (payload.media.type == "yt") {
        text += "https://www.youtube.com/watch?v=" + payload.media.id + "\r\n\r\n";
    }
    text += "Queued By " + payload.queueby + "\r\n";
    
    return text;
}

function buildSidebar(payload) {
    var text = "---\r\n\r\n**Now Playing**  \r\n";
    text += '*' + payload.media.title + "*  \r\n";
    if (payload.media.type == "yt") {
        text += "https://www.youtube.com/watch?v=" + payload.media.id + "  \r\n";
    }
    text += "Queued By " + payload.queueby + "\r\n\r\n---\r\n";

    return text;
}

function reserveQueued() {
    try {
        console.log('Reserving beanstalkd job.');
        bean.reserve_with_timeout(1, function (err, jobid, payload) {
            if (typeof jobid == 'undefined') {
                return;
            }
            
            console.log('Got job #' + jobid);
            payload = JSON.parse(payload);
            reddit.auth().then(function () {
                console.log('Authenticated with reddit.');
            
                findPlaylistPost(function (post) {
                    if (post != null) {
                        console.log('Submitting ' + payload.media.title);
                    
                        reddit('/api/comment').post({
                            thing_id: 't3_' + post.data.id,
                            api_type: 'json',
                            text: buildComment(payload)
                        }).then(function () {
                        
                            console.log('Updating sidebar');
                            reddit('/r/pienudes/about/edit.json').get()
                            .then(function(result) {
                                var data = result.data;
                                data.api_type = 'json';
                                data.sr = data.subreddit_id;
                                data.link_type = data.content_options;
                                data.type = data.subreddit_type;
                                
                                var sidebar = buildSidebar(payload);
                                sidebar += data.description.replace(/---([\s\S]*)\*\*Now Playing\*\*([\s\S]*)---/, '');
                                data.description = sidebar;
                                
                                return reddit('/api/site_admin').post(data);
                            }).then(function() {
                                    bean.destroy(jobid, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                            });
                        });
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
    }
}

function findPlaylistPost(cb) {
    reddit('/r/pienudes/new').get().then(function(res) {
        var children = res.data.children;
        for(var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.data.author == "AutoModerator" && child.data.title.indexOf('Playlist') !== -1) {
                cb(child);
                return;
            }
        }
        cb(null);
    });
}
