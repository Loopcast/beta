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
  info: ( id, is_live, callback ) ->
    ref = @

    if @infos[id]?
      callback @infos[ id ]
    else
      socket.rooms.subscribe id
      socket.on id, @on_room_update
      on_load = (error, response) ->
        log "[RoomsController] on_load response", id, is_live, response

        ref.infos[id] = { is_live: is_live, data : response }

        callback ref.infos[id]

      if is_live
        api.rooms.info id, on_load
      else
        api.tapes.get id, on_load
  

  on_room_update: ( data ) =>
    if data.type is 'update'
      if @infos[ data._id ]? and not @infos[ data._id ].is_live
        @infos[ data._id ].data.tape.about = data.data.about
        @infos[ data._id ].data.tape.cover_url = data.data.cover_url
        @infos[ data._id ].data.tape.genres = data.data.genres
        @infos[ data._id ].data.tape.location = data.data.location
        @infos[ data._id ].data.tape.title = data.data.title

      @emit 'update', data

    log "[Rooms Controller] on_room_update", data, data.data.genres, data.data.genres.length

module.exports = new RoomsController