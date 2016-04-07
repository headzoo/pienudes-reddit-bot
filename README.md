Pienudes Bot
============
A bot which updates the daily playlist and sidebar in [/r/pienudes](https://www.reddit.com/r/pienudes).


### Requirements
* NodeJS & NPM
* [Beanstalkd](http://kr.github.io/beanstalkd/)


### Installation
Beanstalkd can be installed using apt-get.
```
sudo apt-get install beanstalkd
```

The app is installed by cloning the repo.
```
git clone git@github.com:headzoo/pienudes.git
cd pienudes
npm install
```

Move the configuration file, and edit the values.
```
mv config_dist.js config.js
```


### Running
```
node app.js
```


### How it Works
Pienudes starts by connecting to beanstalkd, and watching the `pienudes_playlist` tube.
The jobs found in the tube can come from any source, but must be a JSON *string* with
the following format and values.

```
{
    media: {
        id: 'WIKqgE4BwAY',
     	type: 'yt',
     	title: 'BABYMETAL - Gimme chocolate!!',
     	seconds: 270,
     	duration: '04:30'
    },
    queueby: 'headzoo'
}
```
The data structure represents a video which started playing. The `media.id` value is the
id of the video on Youtube. The full Youtube link can be created by concatenating the id to
the url "https://youtu.be/". For example "https://youtu.be/WIKqgE4BwAY". The `media.type`
value of "yt" represents Youtube. Other values may also be used.

When the bot finds a new job in the tube, it adds a comment to the most recent "Daily Playlist"
post created by AutoModerator in /r/pienudes. It will also update the /r/pienudes sidebar with
the info under the "Now Playing" section.
