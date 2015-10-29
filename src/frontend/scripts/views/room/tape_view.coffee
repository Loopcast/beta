require 'app/utils/time/livestamp'
socket        = require 'app/controllers/socket'
happens       = require 'happens'

module.exports = class TapeView

  tape_id: null

  constructor: ( @dom ) ->
    happens @

    @tape_id = @dom.data 'tape-id'

    app.body.addClass 'tape_view'
    view.on 'binded', @on_views_binded
    

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    log "[TapeView] on_views_binded", socket
    if not socket.id
      socket.rooms.subscribe @tape_id, @something
    else
      socket.rooms.subscribe @tape_id
      @something()


    socket.on @tape_id, ( data ) =>
      log "[TapeView on socket event]", data.type, data

      if data.type is 'message'
        @emit 'message', data
      else if data.type is 'like'
        @emit 'like', data

  something: (data) =>
    log "[TapeView] something", data

  destroy: ->
    app.body.removeClass 'tape_view'