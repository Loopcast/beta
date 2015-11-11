happens   = require 'happens'
socket    = require 'app/controllers/socket'
api       = require 'app/api/loopcast/loopcast'

class RoomsController

  # Class variables
  instance = null

  # Object variables
  data : null
  socket_id: false

  # Stores all the rooms/tapes infos already fetched
  infos: {}

  constructor: ->

    if RoomsController.instance
      console.error "You can't instantiate this UserController twice" 
      return

    RoomsController.instance = @
    happens @ 


  ###
  returns the info of the room/tape with id = id by calling the callback provided
  it stores the info so the second time is requested, it won't call the api
  ###
  info: ( id, type, callback ) ->
    ref = @

    if not @infos[id]?
      socket.rooms.subscribe id
      socket.on id, @on_room_update
    
      
    on_load = (error, response) ->
      log "[RoomsController] on_load response", id, type, response

      ref.infos[id] = { type: type, data : response }

      callback ref.infos[id]

    if type is 'room'
      api.rooms.info id, on_load
    else
      api.tapes.get id, on_load
  

  on_room_update: ( data ) =>
    log "[Rooms Controller] on_room_update", data, data._id
    if not @infos[ data._id ]?
      log "[Rooms Controller] id not found. returning."
      return 

    @emit 'update', data



module.exports = new RoomsController