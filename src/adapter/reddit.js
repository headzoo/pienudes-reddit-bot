"use strict";

var Config    = require("../../config");
var Snoocore  = require("snoocore");
var Markdown  = require("../markdown");

var noop   = function() {};

var reddit = new Snoocore({
    userAgent: Config.reddit.userAgent,
    oauth: {
        type: "script",
        key: Config.reddit.oauth.key,
        secret: Config.reddit.oauth.secret,
        username: Config.reddit.oauth.username,
        password: Config.reddit.oauth.password,
        scope: ["identity", "read", "vote", "edit", "modconfig", "submit"]
    }
});


module.exports = {
    update: function(media, callback) {
        callback = callback || noop;
        var self = this;
    
        self.auth(function () {
            self.findPlaylistPost(function(err, post) {
                if (err) {
                    callback(err);
                } else if (post) {
                    self.writeComment(post.data.id, media, function(err) {
                        if (!err) {
                            self.updateSidebar(media, callback);
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback();
                }
            });
        });
    },
    
    auth: function(callback) {
        callback = callback || noop;
        reddit.auth()
            .then(function() {
                console.log("Authenticated with reddit.");
                callback();
            });
    },
    
    writeComment: function(thing_id, media, callback) {
        callback = callback || noop;
        var err  = null;
        
        console.log("Submitting " + media.media.title + " to t3_" + thing_id);
        reddit("/api/comment")
            .post({
                thing_id: "t3_" + thing_id,
                api_type: "json",
                text: Markdown.buildPlaylistComment(media)
            })
            .catch(function(e) {
                err = e;
            }).done(function() {
                callback(err);
            })
    },
    
    updateSidebar: function(media, callback) {
        callback = callback || noop;
        var err  = null;
        
        console.log("Updating sidebar");
        reddit("/r/pienudes/about/edit.json")
            .get()
            .then(function(result) {
                var data         = result.data;
                var sidebar      = Markdown.buildNowPlaying(media);
                sidebar += data.description.replace(/----([\s\S]*)\*\*Now Playing\*\*([\s\S]*)----/, "").trim();
                data.description = sidebar;
                data.api_type    = "json";
                data.sr          = data.subreddit_id;
                data.link_type   = data.content_options;
                data.type        = data.subreddit_type;
            
                reddit("/api/site_admin")
                    .post(data)
                    .catch(function(e) {
                        err = e;
                    }).done(function() {
                        callback(err);
                    });
            }).catch(function(e) {
                err = e;
            });
    },
    
    findPlaylistPost: function(callback) {
        callback = callback || noop;
        var err  = null;
        var post = null;
        
        console.log("Looking for playlist post");
        reddit("/r/pienudes/new")
            .get()
            .then(function (res) {
                var children = res.data.children;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child.data.author == "AutoModerator" && child.data.title.indexOf("Playlist") !== -1) {
                        post = child;
                        break;
                    }
                }
            }).catch(function(e) {
                err = e;
            }).done(function() {
                callback(err, post);
            });
    }
};