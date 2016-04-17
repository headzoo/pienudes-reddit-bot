module.exports = {
    reddit: {
        userAgent: '/u/PieNudes pienudes_playlist@0.0.1',
        subId: 't5_3e2bs',
        oauth: {
            key: 'xxxx', // OAuth client key (provided at reddit app)
            secret: 'xxxx', // OAuth secret (provided at reddit app)
            username: 'PieNudes', // Reddit username used to make the reddit app
            password: 'xxxx' // Reddit password for the username
        }
    },
    twitter: {
        consumer_key: 'xxxx',
        consumer_secret: 'xxxx',
        access_token_key: 'xxxx',
        access_token_secret: 'xxxx'
    },
    beanstalkd: {
        host: '127.0.0.1',
        port: 11300,
        tube: 'pienudes_playlist',
        delay: 30000
    }
};