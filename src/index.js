'use strict';

var Snoocore  = require('snoocore');
var fivebeans = require('fivebeans');
var Config    = require('../config');
var twitter   = require('./adapter/twitter');
var reddit    = require('./adapter/reddit');

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

var twitter_counter = 0;

function reserveQueued() {
    try {
        console.log("Reserving beanstalkd job.");
        bean.reserve_with_timeout(1, function (err, job_id, payload) {
            if (typeof job_id == 'undefined') {
                return;
            }
            console.log("Got job #" + job_id);
            var media = JSON.parse(payload);
            
            reddit.update(media, function() {
                console.log("Reddit has been updated.");
    
                twitter_counter++;
                if (twitter_counter == 20) {
                    console.log("Updating twitter.");
                    
                    twitter.tweetMedia(media, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Twitter has been updated.");
                        }
                    });
                    twitter_counter = 0;
                }
                
                bean.destroy(job_id, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
    }
}