Modal = require './modal'
L = require 'app/api/loopcast/loopcast'
notify = require 'app/controllers/notify'

module.exports = class RoomModal extends Modal
  cover_uploaded: ""
  timeout_title: null
  current_data: null
  constructor: ( @dom ) ->
    
    super @dom

    @title = @dom.find '.roomname'
    
    @location = @dom.find '.location'
    @location_label = @dom.find '.location_label'
    @description = @dom.find '.description'
    @message = @dom.find '.message'

    @submit = @dom.find '.submit_button'

    view.once 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main

    @room_image_uploader = view.get_by_dom @dom.find( '.room_image' )

    # if not @room_image_uploader
    #   log "[rooms/createModal] views not binded yet!!!"
    #   return

    # log "[Room Modal] @room_image_uploader", @room_image_uploader

    @genre = view.get_by_dom @dom.find( '.genre' )

    @room_image_uploader.on 'started'  , @_on_cover_upload_started
    @room_image_uploader.on 'completed', @_on_cover_changed
    @title.on 'keyup'                 , @_on_title_changed
    @location.on 'keyup'              , @_on_location_changed
    @description.on 'keyup'           , @_on_description_changed
    @genre.on 'change'                , @_on_genre_changed
    @submit.on 'click'                , @_submit
  
  lock: ->
    log "[RoomModal] lock"
    @dom.addClass 'lock'
    @locked = true

  unlock: ->
    log "[RoomModal] unlock"
    @dom.removeClass 'lock'
    @locked = false

  _on_cover_upload_started: =>
    log "[Room modal] _on_cover_upload_started"
    @lock()

  _on_cover_changed: (data) =>
    @cover_uploaded = data.result.secure_url
    @unlock()
    @emit 'input:changed', { name: 'cover', value: data.result }

  _on_title_changed: ( ) =>
    @_check_length @title
    clearTimeout @timeout_title
    if @title.val().length > 0
      @timeout_title = setTimeout @_check_room_name, 1000

    @emit 'input:changed', { name: 'title', value: @title.val() }

  _on_genre_changed: ( data ) =>
    # log "_on_genre_changed", data
    @emit 'input:changed', { name: 'genre', value: data.join( ', ' ) }

  _on_location_changed: ( ) =>
    @emit 'input:changed', { name: 'location', value: @location.val() }

  _on_description_changed: ( ) =>
    @emit 'input:changed', { name: 'description', value: @description.val() }

  _check_length: ( el ) ->
    if el.val().length > 0
      el.removeClass 'required'
    else
      el.addClass 'required'

  _check_room_name: =>
    L.rooms.is_available @title.val(), (error, result) =>
      # log "[RoomModal] _check_room_name", @title.val(), "available?", result.available
      if error
        log error
        return 

      if not result.available
        @title.addClass( 'required' ).focus()
        notify.error 'Room name not available'


  _submit: ( ) =>
    
    if @locked
      return

    # quick validation sketch
    if not @title.val()
      @title.addClass( 'required' ).focus()
      return 

    log "[Check here] ----->", @genre.get_tags()
    data = 
      title    : @title.val()
      genres   : @genre.get_tags( true )
      location : @location.val()
      about    : @description.val()
      cover    : @cover_uploaded

    if @is_tape()
      data.public = @current_data.public
      data.cover_url = data.cover
      if data.cover_url.length <= 0
        data.cover_url = @current_data.cover_url

      delete data.cover


    # log "[Create Room]submit", data

    @emit 'submit', data

  is_tape: ->
    return @current_data? and not @current_data.is_live    

  show_message: ( msg ) ->
    @message.html( msg ).show()

  hide_message: ( ) ->
    @message.hide()

  open_with_data: ( data ) ->
    log "[RoomModal] open_with_data", data, data.genres, data.genres.length
    @current_data = data

    @dom.addClass 'edit_modal'
    @title.val data.title
    @genre.add_tags data.genres
    @location.val data.location
    @description.val data.about
    # @location.hide()
    # @location_label.hide()
    # @description.hide()

    @open()

    return false

  close: =>
    super()

    @genre.reset_tags()

  set_type: ( type ) ->
    log "[RoomModal] set_type", type
    labels = 
      tape: 
        title: "Edit your recording"
        title_placeholder: "Enter name of your recording"
        desc_placeholder: "Describe your recording"
      room:
        title: "Edit your room"
        title_placeholder: "Enter room name"
        desc_placeholder: "Describe your room"

    @dom.find( '.title' ).html labels[ type ].title
    @dom.find( '.roomname' ).attr 'placeholder', labels[ type ].title_placeholder
    @dom.find( '.description' ).attr 'placeholder', labels[ type ].desc_placeholder

  destroy: -> 
    # log "[RoomModal] destroy"
    # @room_image_uploader.off 'completed', @_on_cover_changed
    @title.off       'keyup'  , @_on_title_changed
    @location.off    'keyup'  , @_on_location_changed
    @description.off 'keyup'  , @_on_description_changed
    @genre.off       'change' , @_on_genre_changed
    @submit.off      'click'  , @_submit
    @room_image_uploader.off 'started'  , @_on_cover_upload_started
    @genre = null

    super()




    



