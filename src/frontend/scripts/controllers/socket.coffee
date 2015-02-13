###
# Socket controller will be used to communicate with desktop app AppCast
###

aware    = require 'aware'
# shortcut for vendor scripts
v       = require 'app/vendors'

# the controller is the model, modern concept of hermaphrodite file
socket = aware {}

# only enable if available on window
WebSocket = window.WebSocket || null

# websocket connections
socket.messages = {}
socket.vu       = {}


socket.set 'connected', false
# connects to AppCast's WebSocket server and listen for messages
socket.connect = ->

  if not WebSocket
    return console.info '+ socket controller wont connect'

  messages_socket = 'ws://localhost:51234/loopcast/messages'
  socket.messages = new v.ReconnectingWebsocket messages_socket

  socket.messages.onopen = ->
    console.info '- socket controller connection opened'

    socket.set 'connected', true

    socket.messages.send JSON.stringify [ 'get_input_devices' ]

  socket.messages.onclose = ->
    console.info '- AppCast isnt OPEN, will retry to connect'

    socket.set 'connected', false


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



  vu_socket = 'ws://localhost:51234/loopcast/vu'
  socket.vu = new v.ReconnectingWebsocket vu_socket

  socket.vu.onopen = ->
    console.info '- socket VU connection opened'

    socket.set 'vu:connected', true

  socket.vu.onclose = ->
    console.info '- socket VU connection closed'

    socket.set 'vu:connected', false

  # route incoming messages to socket.callbacks hash
  socket.vu.onmessage = ( e ) ->

    reader = new FileReader

    reader.onload = ( e ) ->
      buffer = new Float32Array e.target.result

      socket.set 'stream:vu', buffer  

    reader.readAsArrayBuffer e.data

socket.start_stream = ( device_name ) ->

  mount_point = "hems"
  password    = "loopcast2015"

  payload = 
    device_name : device_name
    mount_point : mount_point
    password    : password

  socket.set "stream:starting", true
  socket.messages.send JSON.stringify [ "start_stream", payload ]

socket.stop_stream = ->

  socket.set "stream:stopping", true
  socket.messages.send JSON.stringify [ "stop_stream" ]


###
# callbacks are called by "messages" coming from the WebsocketServer created
# by the desktop application AppCast
###
socket.callbacks =
  input_devices  : ( args ) ->

    # console.log "+ socket controllr got input devices", args.devices

    # saves list of devices and broadcast change
    socket.set 'input_devices', args.devices

    # automaticaly testing stream
    # socket.start_stream "Soundflower (2ch)"

  stream_started : ( args ) ->

    if args? and args.error?

      console.error "- stream_started error:", args.error

      socket.set "stream:error", args.error

      return

    # save current stream:online status
    socket.set 'stream:online', true

    # reset other straming flags
    socket.set "stream:starting", null
    socket.set "stream:error"   , null

  stream_stopped: ->

    # save current stream:online status
    socket.set 'stream:online'  , false
    socket.set "stream:stopping", null

###
# Listening to messages
###
socket.on 'input_device', ->

  if socket.get 'stream:online'
    console.error '- input device changed while stream:online'
    console.error '? what should we do'

# should try to connect only on it's own profile page
socket.connect()

module.exports = socket