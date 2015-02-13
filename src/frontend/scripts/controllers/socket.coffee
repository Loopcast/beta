###
# Socket controller will be used to communicate with desktop app AppCast
###

aware = require 'aware'

# the controller is the model, modern concept of hermaphrodite file
socket = aware {}

# only enable if available on window
WebSocket = window.WebSocket || null

# websocket connections
socket.messages = {}
socket.vu       = {}

socket.connect = ->

  if not WebSocket
    return console.info '+ socket controller wont connect'

  socket.messages = new window.WebSocket 'ws://localhost:51234/loopcast/messages'

  socket.messages.onopen = ->
    socket.messages.send JSON.stringify [ 'get_input_devices' ]

  socket.messages.onclose = ->
    console.error '- socket controller connect closed'

  # route incoming messages to socket.callbacks hash
  socket.messages.onmessage = ( e ) ->

    json = e.data

    try
      from_json = JSON.parse json
    catch error
      console.error "- socket controller error parsing json"
      console.error error
      return error

    method = from_json[0]
    args   = from_json[1]
    
    if 'error' == method
      return console.log 'error', args

    if typeof socket.callbacks[method] is 'function'
      socket.callbacks[method]( args )
    else 
      console.log " + socket controller has no callback for:", method

socket.start_stream = ( device_name ) ->

  mount_point = "hems"
  password    = "loopcast2015"

  payload = 
    device_name : device_name
    mount_point : mount_point
    password    : password

  socket.messages.send JSON.stringify [ "start_stream", payload ]

socket.callbacks =
  input_devices  : ( args ) ->

    # console.log "+ socket controllr got input devices", args.devices

    # saves list of devices and broadcast change
    socket.set 'input_devices', args.devices

    # automaticaly testing stream
    # socket.start_stream "Soundflower (2ch)"

  stream_started : ->

    # save current streaming status
    socket.set 'streaming', true

    console.log "stream_started"

    # reload the audio tag
    $( 'audio' ).attr( 'src', $( 'audio' ).attr( 'src' ) )


# should try to connect only on it's own profile page
socket.connect()

module.exports = socket