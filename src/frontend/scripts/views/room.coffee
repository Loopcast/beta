L               = require 'api/loopcast/loopcast'
navigation      = require 'app/controllers/navigation'
Strings         = require 'app/utils/string'
user_controller = require 'app/controllers/user'
notify          = require 'app/controllers/notify'
LoggedView      = require 'app/views/logged_view'
happens         = require 'happens'
api             = require 'app/api/loopcast/loopcast'
Cloudinary      = require 'app/controllers/cloudinary'
transform       = require 'lib/cloudinary/transform'
pusher_room_id  = require 'lib/pusher/get_room_id'
RoomModal       = require 'app/views/modals/room_modal'


module.exports = class Room extends LoggedView
  room_created: false
  publish_modal: null
  exit_modal: null

  constructor: ( @dom ) ->
    super @dom

    happens @

    @elements = 
      title       : @dom.find '.cover .name'
      genre       : @dom.find '.cover .genres'
      location    : @dom.find '.cover .location'
      cover       : @dom.find '.cover .cover_image'
      description : @dom.find '.chat_header p'

    if Strings.is_empty( @elements.title.html() )
      @elements.title.addClass 'hidden'



  on_views_binded: ( scope ) =>
    super scope
    return if not scope.main
    @modal = view.get_by_dom '#room_modal'
    @modal.on 'input:changed', @on_input_changed
    @modal.on 'submit', @on_modal_submit

    if @is_create_page()
      @modal.open()
      @dom.addClass 'page_create'
    else
      @on_room_created()

    

  on_input_changed: ( data ) =>
    switch data.name
      when 'title', 'description'
        @elements[ data.name ].html data.value

        if data.value.length > 0
          @elements[ data.name ].removeClass 'hidden'
        else
          @elements[ data.name ].addClass 'hidden'
      when 'cover'
        @elements[ data.name ].css
          'background-image': "url(#{data.value.secure_url})"


  on_modal_submit: ( data ) =>
    log "[Room] on_modal_submit", data

    @modal.hide_message()
    @modal.show_loading()

    m = @modal

    ref = @
    L.rooms.create data, ( error, data ) ->

      if error?

        notify.error error.responseJSON.message

        m.hide_loading()

        return false

      delay 1000, =>

        # appends room_id to body in order to be compatible with 
        # server side rendered template
        hidden = "<input type='hidden' id='room_id' value='#{data._id}'>"
        $( 'body' ).append hidden

        navigation.go_silent "/#{data.info.user}/#{data.info.slug}"

        m.close()

        $( '.create_room_item' ).removeClass 'selected'

        ref.on_room_created( data )

  on_room_created: (data) ->


    @owner_id = document.getElementById( 'owner_id' ).value
    @room_id  = document.getElementById( 'room_id' ).value
    log "on room created", data, @owner_id
    
    @room_created = true
    @dom.removeClass( 'page_create' ).addClass( 'room_ready' )

    @room_subscribe_id = pusher_room_id @owner_id, @room_id
    @channel = pusher.subscribe @room_subscribe_id
    @channel.bind 'listener:added', @on_listener_added
    @channel.bind 'listener:removed', @on_listener_removed
    @channel.bind 'message', @on_message
    @publish_modal = view.get_by_dom '#publish_modal'
    @confirm_exit_modal = view.get_by_dom '#confirm_exit_modal'
    
    @publish_modal.on 'room:published', @on_room_published
    @live_button = view.get_by_dom '#go_live_button'
    @live_button.on 'changed', @_on_live_changed
    @record_button = view.get_by_dom '#record_button'
    @record_button.on 'changed', @_on_record_changed

    @emit 'room:created', data

    if data
      @dom.find( '.chat_header.v_center' ).html data.about

      @update_genres data.info.genres


    if user_controller.check_guest_owner()
      @manage_edit()
    else
      @show_guest_popup()

    if @dom.hasClass 'room_live'
      delay 1000, => 
        log "----------------- (0)"
        @on_room_live()

    L.rooms.visit @room_id, (error, response) ->
      log "[Room] visit", error, response

  update_genres: (genres) ->
    log "UPDATE GENRES", genres
    @tags_wrapper = @dom.find '.tags'
    if genres.length > 0
      @tags_wrapper.removeClass 'no_tags'
      for g in genres
        @tags_wrapper.append '<a class="tag" title="'+g+'" href="/explore?genres='+g+'">'+g+'</a>'


  on_room_published: (room_id) =>
    log "[Room] on_room_published", room_id, @room_id
    if room_id is @room_id
      @dom.addClass 'room_public'

  
  _on_live_changed: (data) =>
    log "[Room] on live changed", data
    if data
      @on_room_live()
    else
      @on_room_offline()

  _on_record_changed: (data) =>
    log "[Room] on live changed", data
    if data
      @dom.addClass 'room_recording'
    else
      @dom.removeClass 'room_recording'

  on_room_offline: ->
    @dom.removeClass 'room_live'
    app.player.stop()
    navigation.set_lock_live false, ""
    
  on_room_live: ->
    @dom.addClass 'room_live'
    if not user_controller.check_guest_owner()
      log "----------------- on_room_live"
      app.player.fetch_room @room_id, =>
        log "[ROOM] live room fetched."
        app.player.play @room_id
    else
      navigation.set_lock_live true, location.pathname
    



  show_guest_popup: ->
    link = "/rooms/create"
    message = 'Do you want to set up your own live room like this?'
    if user_controller.is_logged()
      notify.guest_room_logged message
    else
      notify.guest_room_unlogged message

  manage_edit: ->
    appcast.connect()
    @description = view.get_by_dom '#description_room'
    @title = view.get_by_dom @dom.find( '.name' )
    @change_cover_uploader = view.get_by_dom @dom.find( '.change_cover' )

    @description.on 'changed', @on_description_changed
    @title.on 'changed', @on_title_changed
    @change_cover_uploader.on 'completed', @on_cover_uploaded

  on_cover_uploaded: (data) =>
    log "[Cover uploader]", data.result.url

    cover = transform.cover data.result.url

    @dom.find( '.cover_image' ).css
      'background-image': "url(#{cover})"

    @save_data cover_url: data.result.url

  on_description_changed: ( value ) =>
    @save_data about: value, (response) =>

  on_title_changed: ( value ) =>
    @save_data title: value, (error, response) =>
      log "title changed", response
      if not error
        navigation.go_silent "/#{user_controller.data.username}/#{response[ 'info.slug' ]}"



  save_data: ( data, callback = ->) ->
    api.rooms.update @room_id, data, callback

  on_user_logged: ( data ) =>
    img = @dom.find '.author_chat_thumb'
    if not img.data( 'original' )?
      img.data( 'original', img[0].src )

    img[0].src = user_controller.data.images.chat_thumb

  on_user_unlogged: ( data ) =>

  on_listener_added: ( listener ) =>
    # log "[Room] on_listener_added", listener
    @emit 'listener:added', listener

  on_listener_removed: ( listener ) =>
    # log "[Room] on_listener_removed", listener
    @emit 'listener:removed', listener

  on_message: ( message ) =>
    # log "[Room] on_message", message
    @emit 'message', message

  is_guest: ->
    u = user_controller.data
    guest = location.pathname.indexOf( "/#{u.username}" ) isnt 0

  is_create_page: ( ) ->
    location.pathname is '/rooms/create'

  destroy: ->
    navigation.set_lock_live false, ""

    if @room_created
      pusher.unsubscribe @room_subscribe_id
      @channel.unbind 'listener:added', @on_listener_added
      @channel.unbind 'listener:removed', @on_listener_removed
      @channel.unbind 'message', @on_message

    if user_controller.check_guest_owner() and @description?
      @description.off 'changed', @on_description_changed
      @title.off 'changed', @on_title_changed
      @change_cover_uploader.off 'completed', @on_cover_uploaded

    if @publish_modal
      @publish_modal.off 'room:published', @on_room_published
      view.destroy_view @publish_modal
      view.destroy_view @confirm_exit_modal
      @publish_modal = null
      @confirm_exit_modal = null

    if @live_button
      @live_button.off 'changed', @_on_live_changed
      

    view.destroy_view @modal
    @modal = null
    super()

    
    
    