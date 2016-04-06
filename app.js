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
        scope: [ 'identity', 'read', 'vote', 'submit' ]
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
    text += "Queued By " + payload.queueby + "\r\n\r\n";
    if (payload.media.type == "yt") {
        text += "https://www.youtube.com/watch?v=" + payload.media.id + "\r\n";
    }
    
    return text;
}

function reserveQueued() {
    try {
        console.log('Reserving beanstalkd job.');
        bean.reserve(function (err, jobid, payload) {
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
                            bean.destroy(jobid, function (err) {
                                if (err) {
                                    console.log(err);
                                }
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
