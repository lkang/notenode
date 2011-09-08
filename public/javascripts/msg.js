
var socket = io.connect('http://yaygi.no.de');
// var socket = io.connect('http://falling-sunrise-268.herokuapp.com');
// var socket = io.connect('http://localhost');
  
  global_id = 1;
  function nextid() {
    global_id = global_id + 1 + new Date().valueOf();
    return global_id;
  }
  
  socket.on('create', function(data) {
    //create a new one. fill it with data. 
    var newmsg = $('#proto_msg').children().first().clone();
    var id = data.guid
    
    newmsg.draggable();
    newmsg.attr('id', id );
    newmsg.css('position', 'absolute');
    $('#msgcanvas').append(newmsg);
    
    var msginput = $('textarea.msginput', newmsg);
    var msgoutput = $('.msgarea', newmsg)
    msginput.keyup( function( event ) {
      if( event.keyCode == 13 ) {
        text = msginput.val();
        msginput.val('');
        socket.emit( 'newnote', { text: text, guid: id })
      }
    });
    
    newmsg.bind('dragstop', function(event) {
      socket.emit( 'dragstop', { guid : id, left: newmsg.css('left'), top: newmsg.css('top')})
    });
    
    // newmsg.bind('drag', function(event) {
      // socket.emit( 'drag', { guid : id, left: newmsg.css('left'), top: newmsg.css('top')})
    // })

    socket.on('drag', function(data) {
      if( data.guid != id )
        return;
      var tol = 10;
      var left = parseInt( newmsg.css('left'), 10 );
      var top  = parseInt( newmsg.css('top'), 10 );
      var dleft = parseInt( data.left, 10 );
      var dtop  = parseInt( data.top, 10);
      if((dleft > left + tol) || (dleft < left - tol) )
        newmsg.css('left', data.left );
      if((dtop > top + tol) || (dtop < top - tol) )
        newmsg.css('top', data.top);
    })
    
        
    socket.on('dragstop', function(data) {
      if( data.guid != id )
        return;
      newmsg.css('left', data.left );
      newmsg.css('top', data.top);
    })
    
    socket.on('update', function(data) {
      console.log( data );
      if( data.guid != id )
        return; 
      msgoutput.text(data.text)
    });
  })
  
  $('body').dblclick( function(event) {
    socket.emit( 'created', { text: "", guid: nextid()} );
  })
  
