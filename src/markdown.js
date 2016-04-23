'use strict';

var Media = require('./media');

module.exports = {
    /**
     * Creates and returns the markdown for a playlist comment
     * 
     * @param {object} job Beanstalkd job
     * @returns {string}
     */
    buildPlaylistComment: function(job) {
        if (job.queueby[0] == "@") {
            job.queueby = job.queueby.substring(1);
        }
        var text = job.media.title + "\r\n\r\n";
        if (job.media.type == "yt") {
            text += Media.getYoutubeLink(job.media.id) + "\r\n\r\n";
        }
        text += "Queued By: [" + job.queueby + "](https://pienudes.com/user/" + job.queueby + ")\r\n";
    
        return text;
    },
    
    /**
     * Creates and returns the markdown for the "Now Playing" sidebar widget
     * 
     * @param {object} job Beanstalkd job
     * @returns {string}
     */
    buildNowPlaying: function(job) {
        if (job.queueby[0] == "@") {
            job.queueby = job.queueby.substring(1);
        }
        var text = "----\r\n\r\n**Now Playing**  \r\n";
        text += '*' + job.media.title + "*  \r\n";
        if (job.media.type == "yt") {
            text += Media.getYoutubeLink(job.media.id) + "  \r\n";
        }
        text += "Queued By: [" + job.queueby + "](https://pienudes.com/user/" + job.queueby + ")\r\n\r\n----\r\n";
    
        return text;
    },
    
    /**
     * Creates and returns the text for a tweet
     * 
     * @param {object} job Beanstalkd job
     * @returns {string}
     */
    buildTweet: function(job) {
        if (job.queueby[0] == "@") {
            job.queueby = job.queueby.substring(1);
        }
        var text = job.queueby.substring(0, 10) + " is playing " + job.media.title.substring(0, 15) + " at https://pienudes.com/r/lobby #chat #music ";
        text += Media.getYoutubeLink(job.media.id);
        
        return text;
    }
};