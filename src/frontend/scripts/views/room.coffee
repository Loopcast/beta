L               = require 'api/loopcast/loopcast'
navigation      = require 'app/controllers/navigation'
socket          = require 'app/controllers/socket'
Strings         = require 'app/utils/string'
user_controller = require 'app/controllers/user'
notify          = require 'app/controllers/notify'
LoggedView      = require 'app/views/logged_view'
happens         = require 'happens'
api             = require 'app/api/loopcast/loopcast'
Cloudinary      = require 'app/controllers/cloudinary'
transform       = require 'lib/cloudinary/transform'
RoomModal       = require 'app/views/modals/room_modal'
PeopleList      = require 'app/utils/rooms/people_list'

module.exports = class Room extends LoggedView
  room_created: false
  publish_modal: null
  exit_modal: null
  sidebar_right: null
  current_status: null


  constructor: ( @dom ) ->
    super @dom

    happens @

    @people_list = new PeopleList

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

    @title_input = view.get_by_dom @dom.find( 'h1.name' )
    @desc_input = view.get_by_dom @dom.find( '#description_room' )

    @sidebar_right = view.get_by_dom '.sidebar_right'

    if @is_create_page()
      @modal.open()
      @dom.addClass 'page_create'
    else
      @on_room_created()

    

  on_input_changed: ( data ) =>
    switch data.name
      when 'title', 'description'
        if data.name is 'title'
          @title_input.set_text data.value
        else
          @desc_input.set_text data.value

        if data.value.length > 0
          @elements[ data.name ].removeClass 'hidden'
        else
          @elements[ data.name ].addClass 'hidden'
      when 'cover'
        @elements[ data.name ].css
          'background-image': "url(#{data.value.secure_url})"


  on_modal_submit: ( data ) =>
    # log "[Room] on_modal_submit", data

    @modal.hide_message()
    @modal.show_loading()

    m = @modal

    ref = @
    L.rooms.create data, ( error, room ) ->

      if error?

        notify.error error.responseJSON.message

        m.hide_loading()

        return false

      delay 1000, =>

        # appends room_id to body in order to be compatible with 
        # server side rendered template
        hidden = "<input type='hidden' id='room_id' value='#{room._id}'>"
        $( 'body' ).append hidden

        hidden = "<input type='hidden' id='room_slug' value='#{room.info.slug}'>"
        $( 'body' ).append hidden

        navigation.go_silent "/#{room.info.user}/#{room.info.slug}"

        m.close()

        $( '.create_room_item' ).removeClass 'selected'

        ref.on_room_created( room )

  on_room_created: (data) ->

    @owner_id = document.getElementById( 'owner_id' ).value
    @room_id  = document.getElementById( 'room_id' ).value
    # log "on room created", data, @owner_id
    
    @room_created = true
    @dom.removeClass( 'page_create' ).addClass( 'room_ready' )

    # if user don't have socket.id needs to wait for subscription
    if not socket.id
      socket.rooms.subscribe( @room_id, @get_people )
    else
      socket.rooms.subscribe( @room_id )
      @get_people();


    socket.on @room_id, ( data ) =>

      log "[Room DEBUG]", data.type, data

      return @on_like_room        data if data.type is "like"
      return @on_unlike_room      data if data.type is "unlike"
      return @on_message          data if data.type is "message"
      return @people_list.add     data if data.type is "listener:added"
      return @people_list.remove  data if data.type is "listener:removed"
      return @on_status_changed   data if data.type is "status"

      # temp
      # return @on_live_changed     data if (not data.type?) and data.is_live?

      
        # unless user_controller.is_me data.user.id
        #   return @on_listener_added   data 

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
      app.on 'room:go_offline', @room_went_offline

    if @dom.hasClass 'room_live'
      delay 1000, => 
        # log "----------------- (0)"
        @on_room_live()

    L.rooms.visit @room_id, (error, response) ->
      # log "[Room] visit response", error, response


    if user_controller.socket_id isnt false
      @broadcast_enter()
    else
      user_controller.once 'socket:connected', @broadcast_enter

    @check_status()

  on_live_changed: ( data ) =>
    log "[Room live] on_live_changed", data

    if data.is_live? and data.is_live is false
      log "[Room DEBUG] live stop. user check guest owner", user_controller.check_guest_owner()
      if not user_controller.check_guest_owner()
        @_on_live_stop()

  on_status_changed: ( data ) =>

    console.log 'data ->', data

    if data.is_recording 

      console.info "data.is_recording"
      console.info "data.is_recording"
      console.info "data.is_recording"

      Intercom( 'trackEvent', 'recording-successful');
      Intercom( 'trackEvent', 'appcast-successful');

      mixpanel.track('AppCast - Recording Successful')

    if data.is_live?

      if data.is_live is true
        @on_room_live()
        @show_guest_popup()
      else
        @_on_live_stop()



  check_status: =>
    log "[Room] status:changed checking", @room_id
    L.rooms.info @room_id, (error, data) =>
      log "[Room] status:changed", data
      @emit 'status:changed', data
      @current_status = data

  room_went_offline: =>

    log '[Dashboard] ROOM WENT OFFLINE'
    @on_room_offline()
    @live_button.set_active false
    notify.error 'Oops, something went wrong while you were streaming ( or recording ) and your session went offline'

  broadcast_enter: =>
    data = 
      room_id : @room_id
      user    : user_controller.get_info()

    log "[Room] broadcast_enter", data

    L.chat.enter data, ( error, response ) ->
      log "[Room] chat.enter", error, response      


  get_people : =>
    L.chat.people @room_id, (error, response) =>
      log "[People response]", error, response
      user_by_socket = ( socket_id ) ->
        for user in response.users
          if user.socket_id is socket_id

            user = 
              id        : user._id
              socket_id : socket_id
              username  : user.info.username
              name      : user.info.name
              occupation: user.info.occupation
              avatar    : user.info.avatar
              likes : user.likes
              url       : "/" + user.info.username

            return user

        return null

      # log "[Chat people]", response, response.sockets.length
      for socket_id in response.sockets

        if not user = user_by_socket( socket_id )

          # check if the user is myself
          if socket_id is socket.id

            user = 
              id        : user_controller.data._id
              socket_id : socket_id
              username  : user_controller.data.username
              name      : user_controller.data.name
              occupation: user_controller.data.occupation
              avatar    : user_controller.data.avatar
              likes : 0
              url       : "/" + user_controller.data.username

          else

            # TODO: populate with Guest information
            user = 
              socket_id : socket_id
              name      : "Guest"
              occupation: "Guest"
              avatar    : "https://deerfieldsbakery.com/dev/images/items/cookies/Cookies-Decorated-Chocolate-Happy-Face_MD.jpg"
              likes : 0
              url       : "#"

        message = 
          type  : "listener:added", 
          method: "added"
          user  : user

        # log "[Chat people] on_listener added", message
        @people_list.add message

  

  update_genres: (genres) ->
    # log "UPDATE GENRES", genres
    @tags_wrapper = @dom.find '.tags'
    list = @tags_wrapper.find '.list'
    if genres.length > 0
      @tags_wrapper.removeClass 'no_tags'

      for g in genres
        list.append '<a class="tag" title="'+g+'" href="/explore?genres='+g+'">'+g+'</a>'


  on_room_published: (room_id) =>
    # log "[Room] on_room_published", room_id, @room_id
    if room_id is @room_id
      @dom.addClass 'room_public'

  
  _on_live_changed: (data) =>
    # log "[Room] on live changed", data
    if data
      @on_room_live()
    else
      @on_room_offline()

  _on_record_changed: (data) =>
    # log "[Room] on live changed", data
    if data
      @dom.addClass 'room_recording'
    else
      @dom.removeClass 'room_recording'

  on_room_offline: ->
    @dom.removeClass 'room_live'
    app.player.stop()
    navigation.set_lock_live false, ""

  _on_live_stop: ->
    log "[Room] _on_live_stop"

    if user_controller.check_guest_owner()
      notify.info 'Your stream has stopped.'
    else
      notify.info 'The user has ended the stream'

    # console.log 'saved ->', @_src

    @on_room_offline()

    delay 100, =>
      if $( "audio" ).attr( "src" )
        @_src = $( "audio" ).attr( "src" )
        $( "audio" ).attr( "src", "" )
    
  on_room_live: ->

    $( "#player" ).addClass "loading"

    delay 500, =>

      console.log 'loading ->', @_src

      log "[Room] on_room_live"
      @dom.addClass 'room_live'

      if not user_controller.check_guest_owner()

        app.player.fetch_room @room_id, true, =>
          log "[Room] fetch room callback", app.settings.theme

          if @_src
              $( "audio" ).attr( "src", @_src )
              @_src = null

          if app.settings.theme isnt 'mobile'
            log "[Room] inside!"
            app.player.play @room_id



          @show_guest_popup()
            
      else

        app.player.stop()
        navigation.set_lock_live true, location.pathname

        Intercom( 'trackEvent', 'live-successful');
        Intercom( 'trackEvent', 'appcast-successful');

        mixpanel.track('AppCast - Live Successful')
    



  show_guest_popup: ->

    if app.settings.theme isnt 'mobile'
      if user_controller.check_guest_owner()
        message = 'You are now live! Use the sharing icon or Facebook send button below to invite some listeners'
      else
        message = 'You are now listening live on Loopcast'
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
    # log "[Cover uploader]", data.result.url

    cover = transform.cover data.result.url

    @dom.find( '.cover_image' ).css
      'background-image': "url(#{cover})"

    @save_data cover_url: data.result.url

  on_description_changed: ( value ) =>
    @save_data about: value, (response) =>

  on_title_changed: ( value ) =>
    @save_data title: value, (error, response) =>
      # log "title changed", response
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

  on_like_room: ( data ) =>
    @sidebar_right.on_like()

  on_unlike_room: ( data ) =>
    @sidebar_right.on_unlike()



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

      socket.rooms.unsubscribe @room_id
      
      # pusher.unsubscribe @room_subscribe_id
      # @channel.unbind 'listener:added', @on_listener_added
      # @channel.unbind 'listener:removed', @on_listener_removed
      # @channel.unbind 'message', @on_message

    if user_controller.check_guest_owner() and @description?
      @description.off 'changed', @on_description_changed
      @title.off 'changed', @on_title_changed
      @change_cover_uploader.off 'completed', @on_cover_uploaded
      app.off 'room:go_offline', @room_went_offline

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
    @people_list.destroy()
    @people_list = null
    super()
    

    
    
    