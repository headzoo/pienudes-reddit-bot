var Snoocore = require('snoocore');
var Config   = require('./config');

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

/*
reddit.auth().then(function() {
    console.log("Authenticated");
    reddit('/api/comment').post({
        thing_id: 't3_4dkjav',
        api_type: 'json',
        text: 'Hello, World'
    }).then(function(result) {
        console.log(result);
    });
});
*/