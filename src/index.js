'use strict';

var Snoocore  = require('snoocore');
var fivebeans = require('fivebeans');
var Markdown  = require('./markdown');
var Config    = require('../config');

var reddit = new Snoocore({
    userAgent: Config.reddit.userAgent,
    oauth: {
        type: 'script',
        key: Config.reddit.oauth.key,
        secret: Config.reddit.oauth.secret,
        username: Config.reddit.oauth.username,
        password: Config.reddit.oauth.password,
        scope: ['identity', 'read', 'vote', 'edit', 'modconfig', 'submit']
    }
});

var bean = new fivebeans.client(Config.beanstalkd.host, Config.beanstalkd.port);
bean.on('connect', function () {
    bean.watch(Config.beanstalkd.tube, function (err) {
        if (err) {
            throw err;
        }
        reserveQueued();
        setInterval(reserveQueued, Config.beanstalkd.delay);
    });
}).on('error', function (err) {
    throw err;
}).connect();

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
                            text: Markdown.buildPlaylistComment(payload)
                        }).then(function () {
                            
                            console.log('Updating sidebar');
                            reddit('/r/pienudes/about/edit.json').get().then(function (result) {
                                var data         = result.data;
                                var sidebar      = Markdown.buildNowPlaying(payload);
                                sidebar += data.description.replace(/----([\s\S]*)\*\*Now Playing\*\*([\s\S]*)----/, '').trim();
                                data.description = sidebar;
                                data.api_type    = 'json';
                                data.sr          = data.subreddit_id;
                                data.link_type   = data.content_options;
                                data.type        = data.subreddit_type;
                                
                                return reddit('/api/site_admin').post(data);
                            });
                        });
                        
                        bean.destroy(jobid, function (err) {
                            if (err) {
                                console.log(err);
                            }
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
    reddit('/r/pienudes/new').get().then(function (res) {
        var children = res.data.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.data.author == "AutoModerator" && child.data.title.indexOf('Playlist') !== -1) {
                cb(child);
                return;
            }
        }
        cb(null);
    });
}
