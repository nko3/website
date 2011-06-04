var express = require('express')
  , auth = require('connect-auth')
  , io = require('socket.io')
  , pub = __dirname + '/public'
  , port = process.env.PORT || 8000
  , secrets;

try { secrets = require('./secrets'); }
catch(e) { throw "secret keys file is missing. see ./secrets.js.sample."; }

// express
var app = module.exports = express.createServer();

// config
app.configure(function() {
  app.use(require('stylus').middleware(pub));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.session({ secret: secrets.session }));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

app.configure('development', function() {
  // TODO this: https://github.com/masylum/twitter-js/commit/abc4eec8aea128b0d1ec7b936b3838010fb13213
  app.use(auth([ auth.Github({
    appId: 'c07cd7100ae57921a267',
    appSecret: secrets.github_dev,
    callback: 'http://localhost:' + port + '/auth/github'
  })]));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(pub));
  app.set('view options', { scope: { development: true }});
});

app.configure('production', function() {
  app.use(auth([ auth.Github({
    appId: 'c294545b6f2898154827',
    appSecret: secrets.github,
    callback: 'http://nodeknockout.com/auth/github'
  })]));
  app.use(express.errorHandler());
  app.use(express.static(pub, { maxAge: 1000 * 5 * 60 }));
  app.set('view options', { scope: { development: false }});
});

app.listen(port);

// socket.io
app.ws = io.listen(app);

require('util').log("listening on 0.0.0.0:" + port + ".");
