
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
io = require('socket.io').listen(app);

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/test');
console.log( db );
var Note = require('./models.js').Note(db);

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

  Note.find({}, function(err, notes) {
    for( i=0; i<notes.length; i++  ) {
      console.log( "create/update note: ");
      console.log( notes[i] );
      socket.emit( 'create', notes[i] );
      socket.emit( 'update', notes[i] );
      socket.emit( 'dragstop', notes[i] );
    }
  });

  socket.on('created', function(data) { // new note created
    console.log('created a new note')
    console.log(data);
    note = new Note(data);
    note.save();
    io.sockets.emit( 'create', { text: data.text, guid: data.guid });
  });
  
  socket.on('newnote', function(data) {  // update text in a note
    console.log('got a new note');
    console.log(data);
    Note.update({ guid: data.guid }, 
      { text : data.text },
      {},
      function(err, note) {
      console.log( 'saving note');
      console.log( note );
    });
    io.sockets.emit( 'update', { text: data.text, guid: data.guid } );
  });
  
  socket.on('dragstop', function(data) {  // new position for note
    console.log('got dragstop data');
    console.log(data);
    Note.update({ guid: data.guid }, {
      top  : data.top,
      left : data.left
    }, 
    {}, 
    function(err, data) {
      console.log( "in dragstop, updating note. data is: ");
      console.log( data );
    });
    io.sockets.emit( 'dragstop', { guid: data.guid, top: data.top, left: data.left });
  })
  
  socket.on('delete', function(data) {
    Note.remove({ guid: data.guid }, function(err,data) {
      console.log( 'Removing note: guid ' + data.guid );
    });
    io.sockets.emit( 'delete', { guid: data.guid });
  });
});


// port = process.env.PORT || 3000 // for heroku
port = 80 // for no.de
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
