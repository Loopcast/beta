###
# Manages local connection to Appcast
###
_ = require 'lodash'
aware    = require 'aware'
# shortcut for vendor scripts
v       = require 'app/vendors'

L = require 'app/api/loopcast/loopcast'

# the controller is the model, modern concept of hermaphrodite file
appcast = aware {}

# only enable if available on window
WebSocket = window.WebSocket || null

# websocket connections
appcast.messages = {}
appcast.vu       = {}

# counters silent and clipping frames
counter = 
  limit  : 0
  silence: 0

socket_options =
  reconnectInterval   : 100
  maxReconnectInterval: 1500

appcast.set 'connected', false
# reset VU from the start
appcast.set 'stream:vu', 0
# connects to AppCast's WebSocket server and listen for messages
appcast.connect = ->
  return if not app.settings.use_appcast

  if appcast.get 'connected'
    console.error 'Appcast already connected'
    return

  if not WebSocket
    return console.info '+ socket controller wont connect'

  messages_socket = 'ws://127.0.0.1:51234/loopcast/messages'

  appcast.messages = new v.ReconnectingWebsocket messages_socket, null, socket_options

  appcast.messages.onopen = ->
    console.info '- socket controller connection opened'

    appcast.set 'connected', true

    if appcast.get( 'selected_device' )
      # if there is a device selected
      # automatically select it again
      appcast.select_device appcast.get( 'selected_device' )

    appcast.get_devices()

    appcast.messages.send JSON.stringify [ 'version' ]

  appcast.messages.onclose = ->
    console.info '- AppCast CLOSED'

    delay 100, ->
      appcast.set 'stream:vu', [ 0, 0 ]
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



  vu_socket = 'ws://127.0.0.1:51234/loopcast/vu'
  appcast.vu = new v.ReconnectingWebsocket vu_socket, null, socket_options

  appcast.vu.onopen = ->
    console.info '- socket VU connection opened'

    appcast.set 'vu:connected', true

  appcast.vu.onclose = ->
    
    console.info '- socket VU connection closed'

    appcast.set 'vu:connected', false
    appcast.set 'stream:vu', 0

  # route incoming messages to appcast.callbacks hash
  appcast.vu.onmessage = ( e ) ->

    reader = new FileReader

    reader.onload = ( e ) ->
      buffer = new Float32Array e.target.result

      # db = Math.log10( buffer ) * 20

      # dont forward VU if not connected
      if not appcast.get( 'connected' ) then return

      appcast.set 'stream:vu', buffer

      # console.log buffer

      if buffer[0] >= 0.99 or buffer[1] >= 0.99
        counter.limit++
      else
        counter.limit = 0

      if buffer[0] == 0 or buffer[1] == 0
        counter.silence++
      else
        counter.silence = 0

      # clipping
      appcast.set 'vu:clipping', ( counter.limit   >= 4 )
      appcast.set 'vu:silent'  , ( counter.silence >= 6 )

    reader.readAsArrayBuffer e.data

appcast.disconnect = ->

  appcast.messages.close()
  appcast.vu.close()

appcast.get_devices = ->

  appcast.messages.send JSON.stringify [ 'get_input_devices' ]

appcast.start_stream = ( username, room_slug, password, device_name ) ->

  if appcast.get( "stream:starting" )
    return console.error "waiting stream to start, cant start again"

  if appcast.get( "stream:online" )
    return console.error "stream is already online, cant start again"

  if not device_name
    device_name = appcast.get 'selected_device'
      
  # audiopump connection configuration
  payload = 
    device_name : device_name
    mount_point : "loopcast-staging/#{username}_#{room_slug}"
    password    : password
    port        : "80"
    server      : 'inbound-a.cdn.audiopump.co'

  payload.server = '46.101.25.152'
  payload.port   = "80"

  if window.is_beta
    payload.mount_point = "loopcast/#{username}_#{room_slug}"

  console.log 'stream with payload ->', payload

  appcast.set "stream:starting", true

  appcast.messages.send JSON.stringify [ "start_stream", payload ]

appcast.select_device = ( device_name ) ->

  appcast.set 'selected_device', device_name
  appcast.set 'stream:vu', 0
  
  payload = device_name : device_name

  try
    appcast.messages.send JSON.stringify [ "start_audio_device", payload ]
  catch e
    # avoid super weird error
    console.error e

appcast.stop_stream = ->

  appcast.set "stream:streaming", false
  appcast.set 'stream:starting', false
  appcast.set "stream:stopping", true
  appcast.set 'stream:vu', 0
  appcast.messages.send JSON.stringify [ "stop_stream" ]

appcast.get_version = ->

  appcast.messages.send JSON.stringify [ "version" ]

appcast.check = ->

  success = ->
    console.log "SUCCESS"
    console.log arguments

  error = ->
    console.log "ERROR"
    console.log arguments

  try
    $.get( "http://127.0.0.1:51234/" ).done( done ).error( error )
  catch e
    console.warn "CATHCED THE ERROR!"

###
# callbacks are called by "messages" coming from the WebsocketServer created
# by the desktop application AppCast
###
appcast.callbacks =
  input_devices  : ( args ) ->

    appcast.set 'input_devices', args.devices

    if args.active
      appcast.set 'selected_device', args.active
    # else
    #   appcast.set 'selected_device', ''


  audio_device_started : ( args ) ->

    if args? and args.error?

      console.error "- audio_device_started error:", args.error

      return

  stream_started : ( args ) ->

    if args? and args.error?

      console.error "- stream_started error:", args.error

      appcast.set "stream:error", args.error

      Intercom( 'trackEvent', 'appcast-connection-error');

      mixpanel.track('Appcast - Connection Error')


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

    appcast.set 'stream:streaming', false
    appcast.set 'stream:recording', false

    appcast.set "stream:stopping", null
    appcast.set 'stream:vu'      , 0

  version_response: ( data ) ->

    data.build = Number data.build

    # save for later user in the application
    appcast.set "build", data.build

    # notifies backend about user's current AppCast version
    L.user.appcast_version data, ( error, callback ) ->

      if error then console.error error


# should try to connect only on it's own profile page
# appcast.connect()

module.exports = window.appcast = appcast