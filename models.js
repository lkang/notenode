var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var note_schema = new Schema({
  text  : String,
  top   : String,
  left  : String,
  guid  : Number  
});

mongoose.model( 'Note', note_schema );

exports.Note = function(db) {
  return db.model('Note');
}