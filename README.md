PieNudes Reddit Bot
===================

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