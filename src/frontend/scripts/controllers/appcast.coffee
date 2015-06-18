###
# Manages local connection to Appcast
###

aware    = require 'aware'
# shortcut for vendor scripts
v       = require 'app/vendors'

# the controller is the model, modern concept of hermaphrodite file
appcast = aware {}

# only enable if available on window
WebSocket = window.WebSocket || null

# websocket connections
appcast.messages = {}
appcast.vu       = {}


appcast.set 'connected', false
# connects to AppCast's WebSocket server and listen for messages
appcast.connect = ->
  return if not app.settings.use_appcast
  if not WebSocket
    return console.info '+ socket controller wont connect'

  messages_socket = 'ws://localhost:51234/loopcast/messages'

  appcast.messages = new v.ReconnectingWebsocket messages_socket

  appcast.messages.onopen = ->
    console.info '- socket controller connection opened'

    appcast.set 'connected', true

    appcast.get_devices()

    appcast.messages.send JSON.stringify [ 'version' ]

  appcast.messages.onclose = ->
    console.info '- AppCast isnt OPEN, will retry to connect'

    appcast.set 'connected', false


  # route incoming messages to appcast.callbacks hash
  appcast.messages.onmessage = ( e ) ->

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

    if typeof appcast.callbacks[method] is 'function'
      appcast.callbacks[method]( args )
    else 
      console.log " + socket controller has no callback for:", method



  vu_socket = 'ws://localhost:51234/loopcast/vu'
  appcast.vu = new v.ReconnectingWebsocket vu_socket

  appcast.vu.onopen = ->
    console.info '- socket VU connection opened'

    appcast.set 'vu:connected', true

  appcast.vu.onclose = ->
    
    console.info '- socket VU connection closed'

    appcast.set 'vu:connected', false

  # route incoming messages to appcast.callbacks hash
  appcast.vu.onmessage = ( e ) ->

    reader = new FileReader

    reader.onload = ( e ) ->
      buffer = new Float32Array e.target.result

      # db = Math.log10( buffer ) * 20

      appcast.set 'stream:vu', buffer  

    reader.readAsArrayBuffer e.data

appcast.get_devices = ->

  appcast.messages.send JSON.stringify [ 'get_input_devices' ]

appcast.start_stream = ( mount_point, device_name ) ->

  if appcast.get( "stream:starting" )
    return console.error "waiting stream to start, cant start again"

  if appcast.get( "stream:online" )
    return console.error "stream is already online, cant start again"

  password = "beta-radio-client"

  payload = 
    device_name : device_name
    mount_point : mount_point
    password    : password

  appcast.set "stream:starting", true
  appcast.messages.send JSON.stringify [ "start_stream", payload ]

appcast.select_device = ( device_name ) ->

  payload = device_name : device_name

  appcast.messages.send JSON.stringify [ "start_audio_device", payload ]

appcast.stop_stream = ->

  appcast.set "stream:stopping", true
  appcast.messages.send JSON.stringify [ "stop_stream" ]

appcast.get_version = ->

  appcast.messages.send JSON.stringify [ "version" ]

###
# callbacks are called by "messages" coming from the WebsocketServer created
# by the desktop application AppCast
###
appcast.callbacks =
  input_devices  : ( args ) ->

    appcast.set 'input_devices', args.devices

    appcast.set 'selected_device', args.active

  audio_device_started : ( args ) ->

    if args? and args.error?

      console.error "- audio_device_started error:", args.error

      return

  stream_started : ( args ) ->

    if args? and args.error?

      console.error "- stream_started error:", args.error

      appcast.set "stream:error", args.error

      return

    console.info "APPCAST REPLIED: STREAM STARTED!"

    # save current stream:online status
    appcast.set 'stream:online', true

    # reset other straming flags
    appcast.set "stream:starting", null
    appcast.set "stream:error"   , null

  stream_stopped: ->

    # save current stream:online status
    appcast.set 'stream:online'  , false
    appcast.set "stream:stopping", null

  version_response: ( args ) ->

    console.log "current appcat version ~>", args

# should try to connect only on it's own profile page
# appcast.connect()

module.exports = window.appcast = appcast