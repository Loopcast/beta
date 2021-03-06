tags_list     = require 'templates/components/tags_list'
transform     = require 'lib/cloudinary/transform'

module.exports = class UserSet
  constructor: (@dom) ->
    
    @id = @dom.data 'room-id'
    # log "[UserSet] id", @id
    view.on 'binded', @on_views_binded

    @elements = 
      title    : @dom.find( '.session_title a' )
      genres   : @dom.find( '.genres' )
      location : @dom.find( '.location .text' )
      cover    : @dom.find( '.image' )
  
  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    # log "app rooms", app.rooms
    app.rooms.on 'update', @on_update

  on_update: ( data ) =>
    # log "[UserSet] on_room_udpate", data, data._id, @id
    return if data._id isnt @id

    if not data.data?
      data.data = data.room
    # log "[UserSet] on_room_udpate", data

    # @dom.find( '.room_url' ).attr 'href', '/' + user.info.username + '/' + 
    @elements.title.html data.data.title
    @elements.genres.html tags_list( tags: data.data.genres )
    @elements.location.html data.data.location
    if data.data.cover_url.indexOf( '/upload' ) >= 0
      @elements.cover.css 'background-image', 'url('+transform.cover_thumb( data.data.cover_url ) + ')'

  # destroy: ->
  #   app.rooms.off 'update', @on_room_udpate