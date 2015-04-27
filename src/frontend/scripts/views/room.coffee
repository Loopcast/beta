L               = require 'api/loopcast/loopcast'
navigation      = require 'app/controllers/navigation'
Strings         = require 'app/utils/string'
user_controller = require 'app/controllers/user'
notify          = require 'app/controllers/notify'
LoggedView      = require 'app/views/logged_view'
happens         = require 'happens'
pusher_utils    = require 'shared/pusher_utils'
api             = require 'app/api/loopcast/loopcast'

module.exports = class Room extends LoggedView
  room_created: false

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
    
    @room_created = true
    @dom.removeClass( 'page_create' ).addClass( 'room_ready' )

    @room_subscribe_id = pusher_utils.get_room_subscribe_id @owner_id, @room_id
    @channel = pusher.subscribe @room_subscribe_id
    @channel.bind 'listener:added', @on_listener_added
    @channel.bind 'listener:removed', @on_listener_removed
    @channel.bind 'message', @on_message

    @emit 'room:created', data

    if data
      @dom.find( '.chat_header.v_center' ).html data.about

    if @owner_id is user_controller.data.username
      appcast.connect()

      @manage_edit()

  manage_edit: ->
    @description = view.get_by_dom '#description_room'
    @title = view.get_by_dom @dom.find( '.name' )

    @description.on 'changed', @on_description_changed
    @title.on 'changed', @on_title_changed


  on_description_changed: ( value ) =>
    @save_data about: value, (response) =>

  on_title_changed: ( value ) =>
    @save_data title: value, (error, response) =>
      log "title changed", response
      if not error
        navigation.go_silent "/#{user.username}/#{response[ 'info.slug' ]}"



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
    if @room_created
      pusher.unsubscribe @room_subscribe_id
      @channel.unbind 'listener:added', @on_listener_added
      @channel.unbind 'listener:removed', @on_listener_removed
      @channel.unbind 'message', @on_message

    if @owner_id is user_controller.data.username
      appcast.connect()

      @description.off 'changed', @on_description_changed

    super()

    
    
    