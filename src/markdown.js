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
        var text = job.media.title + "\r\n\r\n";
        if (job.media.type == "yt") {
            text += Media.getYoutubeLink(job.media.id) + "\r\n\r\n";
        }
        text += "Queued By: " + job.queueby + "\r\n";
    
        return text;
    },
    
    /**
     * Creates and returns the markdown for the "Now Playing" sidebar widget
     * 
     * @param {object} job Beanstalkd job
     * @returns {string}
     */
    buildNowPlaying: function(job) {
        var text = "----\r\n\r\n**Now Playing**  \r\n";
        text += '*' + job.media.title + "*  \r\n";
        if (job.media.type == "yt") {
            text += Media.getYoutubeLink(job.media.id) + "  \r\n";
        }
        text += "Queued By: " + job.queueby + "\r\n\r\n----\r\n";
    
        return text;
    }
};