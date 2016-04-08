'use strict';

module.exports = {
    /**
     * Creates and returns a youtube link for the given media
     * 
     * @param {string} media_id ID of the media
     * @returns {string}
     */
    getYoutubeLink: function(media_id) {
        return "https://youtu.be/" + media_id;
    }
};