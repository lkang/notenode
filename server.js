
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use('/', express.errorHandler({ dump: true, stack: true }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express',
    myname: 'lkang'
  });
});


io.sockets.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world turning' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('newnote', function(data) {
    console.log('got a new note');
    console.log(data);
    
    io.sockets.emit( 'update', { text: data.text, guid: data.guid } );
  });
  
  socket.on('created', function(data) {
    console.log('created a new note')
    console.log(data);
    io.sockets.emit( 'create', { text: data.text, guid: data.guid });
  })
  
  socket.on('dragstop', function(data) {
    console.log('got dragstop data');
    console.log(data);
    io.sockets.emit( 'dragstop', { guid: data.guid, top: data.top, left: data.left });
  })
  
  socket.on('drag', function(data) {
    console.log('got drag data');
    console.log(data);
    io.sockets.emit( 'drag', { guid: data.guid, top: data.top, left: data.left });
  })
});



app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
