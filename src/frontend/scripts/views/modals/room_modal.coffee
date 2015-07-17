Modal = require './modal'
L = require 'app/api/loopcast/loopcast'
notify = require 'app/controllers/notify'

module.exports = class RoomModal extends Modal
  cover_uploaded: ""
  timeout_title: null
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


    @room_image_uploader.on 'completed', @_on_cover_changed
    @title.on 'keyup'                 , @_on_title_changed
    @location.on 'keyup'              , @_on_location_changed
    @description.on 'keyup'           , @_on_description_changed
    @genre.on 'change'                , @_on_genre_changed
    @submit.on 'click'                , @_submit
    

  _on_cover_changed: (data) =>
    @cover_uploaded = data.result.secure_url
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
    

    # quick validation sketch
    if not @title.val()
      @title.addClass( 'required' ).focus()
      return 

    data = 
      title    : @title.val()
      genres   : @genre.get_tags( true )
      location : @location.val()
      about    : @description.val()
      cover    : @cover_uploaded

    # log "[Create Room]submit", data

    @emit 'submit', data


  show_message: ( msg ) ->
    @message.html( msg ).show()

  hide_message: ( ) ->
    @message.hide()

  open_with_data: ( data ) ->
    # log "[RoomModal] open_with_data", data
    
    @dom.addClass 'edit_modal'
    @title.attr( 'placeholder', 'Enter set name' ).val data.title
    @genre.add_tags data.genres
    # @location.val data.location
    # @description.val data.about
    @location.hide()
    @location_label.hide()
    @description.hide()

    @open()

    return false


  destroy: -> 
    # log "[RoomModal] destroy"
    # @room_image_uploader.off 'completed', @_on_cover_changed
    @title.off       'keyup'  , @_on_title_changed
    @location.off    'keyup'  , @_on_location_changed
    @description.off 'keyup'  , @_on_description_changed
    @genre.off       'change' , @_on_genre_changed
    @submit.off      'click'  , @_submit

    @genre = null

    super()



    



