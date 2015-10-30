require 'app/utils/time/livestamp'
socket        = require 'app/controllers/socket'
happens       = require 'happens'
LoggedView    = require 'app/views/logged_view'
tags_list     = require 'templates/components/tags_list'
transform     = require 'lib/cloudinary/transform'

module.exports = class TapeView extends LoggedView

  tape_id: null
  elements: {}
  constructor: ( @dom ) ->
    happens @

    @tape_id = @dom.data 'tape-id'

    @elements.title       = @dom.find '.tape_title'
    @elements.author      = @dom.find '.tape_author'
    @elements.about       = @dom.find '.tape_description'
    @elements.genres      = @dom.find '.tags'
    @elements.cover       = 
      desktop : @dom.find '.cover_image.for_desktop'
      mobile  : @dom.find '.cover_image.for_mobile'

    

    app.body.addClass 'tape_view'
    view.on 'binded', @on_views_binded
  
  on_update: ( data ) =>
    log "[TapeView] on_update", data
    
    @elements.title.html data.data.title
    @elements.about.html data.data.about
    @elements.genres.html tags_list( tags: data.data.genres )
    @elements.cover.desktop.css 'background-image', 'url('+transform.cover( data.data.cover_url ) + ')'
    @elements.cover.mobile.css 'background-image', 'url('+transform.cover_mobile( data.data.cover_url ) + ')'
    # @elements.title = data.title

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    log "[TapeView] on_views_binded", socket
    socket.rooms.subscribe @tape_id
    socket.on @tape_id, @on_socket_message

  on_socket_message: ( data ) =>
    log "[TapeView on socket event]", data.type, data

    if data.type is 'message'
      @emit 'message', data
    else if data.type is 'like'
      @emit 'like', data
    else if data.type is 'update'
      @emit 'update', data
      @on_update data

  destroy: ->
    app.body.removeClass 'tape_view'
    socket.off @tape_id, @on_socket_message