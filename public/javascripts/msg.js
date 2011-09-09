
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
    
    newmsg.bind('mousedown', function(event) {
      newmsg.css( 'opacity', 0.4 );
    });
    
    newmsg.bind('mouseup', function(event) {
      newmsg.css( 'opacity', 1 );
    });
    
    $(".del", newmsg).bind('click', function(event) {
      socket.emit( 'delete', { guid : id })
    });
    
    // newmsg.bind('drag', function(event) {
      // socket.emit( 'drag', { guid : id, left: newmsg.css('left'), top: newmsg.css('top')})
    // })
  })
  
  socket.on('drag', function(data) {
    var msg = $('#' + data.guid)
    var tol = 10;
    var left = parseInt( msg.css('left'), 10 );
    var top  = parseInt( msg.css('top'), 10 );
    var dleft = parseInt( data.left, 10 );
    var dtop  = parseInt( data.top, 10);
    if((dleft > left + tol) || (dleft < left - tol) )
      msg.css('left', data.left );
    if((dtop > top + tol) || (dtop < top - tol) )
      msg.css('top', data.top);
  })
      
  socket.on('dragstop', function(data) {
    var msg = $('#' + data.guid)
    msg.css('left', data.left );
    msg.css('top', data.top);
  })
  
  socket.on('update', function(data) {
    console.log( 'update: ' + data );
    var msg = $('#' + data.guid)
    var msgoutput = $('.msgarea', msg)
    msgoutput.text(data.text)
  });
  
  socket.on('delete', function(data) {
    console.log( 'deleting note: ' + data );
    var msg = $('#' + data.guid)
    msg.remove();
  });
    
  $('body').dblclick( function(event) {
    socket.emit( 'created', { text: "", guid: nextid()} );
  })
  
