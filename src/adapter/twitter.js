'use strict';

var Config   = require('../../config');
var Twitter  = require('twitter');
var Markdown = require("../markdown");

var noop    = function() {};

var twitter = new Twitter({
    consumer_key: Config.twitter.consumer_key,
    consumer_secret: Config.twitter.consumer_secret,
    access_token_key: Config.twitter.access_token_key,
    access_token_secret: Config.twitter.access_token_secret
});

module.exports = {
    tweetMedia: function(media, callback) {
        callback = callback || noop;
        if (media.media.type != "yt" || media.queueby.length == 0) {
            callback(null, null);
            return;
        }
        
        var tweet = Markdown.buildTweet(media);
        twitter.post("statuses/update", {status: tweet}, function(err, tweet, response) {
            callback(err, response);
        });
    }
};