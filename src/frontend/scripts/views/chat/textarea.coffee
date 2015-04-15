module.exports = ( dom ) ->

  dom.on 'keydown', ( e ) ->
    if e.keyCode is 13

      # grabs the message
      data = 
        message : dom.val()
        room    : location.pathname.split( "/" )[2] # TODO: make it smart
        

      # clear the field
      dom.html ''

      # POST MOFO!!
      request = $.post '/api/v1/chat/message', data

      request.done ( response ) ->
        console.log 'got response', response