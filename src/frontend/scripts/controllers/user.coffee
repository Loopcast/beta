transform = require 'lib/cloudinary/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'
notify = require 'app/controllers/notify'
socket = require 'app/controllers/socket'
api = require 'app/api/loopcast/loopcast'


class UserController

  # Class variables
  instance = null

  # Object variables
  data : null
  is_owner: false
  socket_id: false


  constructor: ->

    if UserController.instance
      console.error "You can't instantiate this UserController twice" 
      return

    UserController.instance = @
    happens @

    window.user = @
    @fetch_from_session()

    view.on 'binded', @on_views_binded 
      

  on_views_binded: ( scope ) =>
    return unless scope.main
    view.off 'binded', @on_views_binded



    api.user.status {}, (error, response) =>
      # log "[User] checking status from the server", error, response.logged
      
      if error or response.logged is false

        emp = ->
        @logout emp, true

      else if @is_logged()
        @_dispatch_login()
      else
        @_dispatch_logout()

  set_socket_id: ( socket_id ) =>
    log "[User] on_socket_connected", socket_id
    @socket_id = socket_id
    @emit 'socket:connected'
  ###
  Called from the outside, when the user logs in
  ###
  login: ( data ) ->

    # This is what we gonna save to the cookie
    @data = 
      _id        : data._id
      avatar     : data.avatar
      email      : data.email 
      created_at : data.created_at 
      images     : transform.all data.avatar
      name       : data.name
      username   : data.username

    log "[UserController] user:logged", @data, data

    @_dispatch_login()
    
    @write_to_session()


    notify.info "You've successufully logged in."

  ###
  Called from the outside, when the user logs out
  ###
  logout: ( callback, disable_notify = false ) ->

    # log "[UserController] logout"
    
    if not @is_logged() then return callback error: code: 'node_logged'

    # log "[User] trying to logout..."

    $.post '/api/v1/user/logout', {}, (data) =>
      # log "[User] logout ~ success", data
      
      @delete_session()

      @_dispatch_logout()

      if not disable_notify
        notify.info "You've successufully logged out."

      callback?()

  is_me: ( id ) ->
    return false if not @is_logged()
    return id is @data._id

  owner_id: ->
    document.getElementById( 'owner_id' )?.value
    
  check_guest_owner: ->
    owner_id = @owner_id()

    # log "user", owner_id
    # log "[User] check owner_id", owner_id
    if owner_id? and @is_logged() and @data._id is owner_id
      app.body.addClass( 'is_owner' ).removeClass( 'is_guest' )
      @is_owner = true
    else
      app.body.removeClass( 'is_owner' ).addClass( 'is_guest' )
      @is_owner = false

    return @is_owner

  create_images: ->

    # console.log "[UserController] NORMALIZE DATA before", @data
    
    if not @data.avatar?
      log "[User Controller] user.avatar is undefined."
      # @data.avatar = UserController.USER_DEFAULT_AVATAR

    # if not @data.cover?
    #   log "[User Controller] user.cover is undefined. Setting default."
    #   @data.cover = UserController.USER_DEFAULT_COVER

    @data.images = transform.all @data.avatar

    @write_to_session()

  name_updated: ( data ) ->
    @data.username = data.username
    @data.name = data.name

    @emit 'name:updated', @data
    @write_to_session()
    

  check_following: (ids, callback) ->
    api.user.is_following ids, (error, response) ->
      # log "[User] is_following response", error, response

      callback response

  follow: (user_id) ->
    log "[User] follow", user_id
    ref = @
    api.user.follow user_id, ( error, result ) ->
      log "[FollowButton] follow response", result
      ref.emit 'user:followed', user_id
      if error
        console.error 'error following #{@user_id}'

  unfollow: (user_id) ->
    log "[User] unfollow", user_id
    ref = @
    api.user.unfollow user_id, ( error, result ) ->
      log "[FollowButton] unfollow response", result
      ref.emit 'user:unfollowed', user_id
      if error
        console.error 'error following #{@user_id}'

  on_user_followed: ( data ) =>
    log "[User] on_user_followed", data
    notify.info data.name + ' is following you!'

  on_upload_finished: ( data ) =>
    log "[User] on_upload_finished", data

  on_upload_error: ( data ) =>
    log "[User] on_upload_error", data

  ###
  Private Methods
  ###
  _dispatch_login: ->

    @create_images()

    log "[====== USER LOGGED =======]"
    log "#{@data.username} / #{@data.name}"
    log @data
    log "[==========================]"


    # Subscribe to the user channel
    socket.subscribe @data._id # or room_id

    socket.on @data._id, ( data ) =>
      log "[User]getting message from socket:", data

      if data.type is "like"
        @on_user_followed data
        return

      if data.type is "upload:finished"
        @on_upload_finished data
        return

      if data.type is "upload:error"
        @on_upload_error data
        return

    # updates intercom information
    window.intercomSettings.name       = @data.name
    window.intercomSettings.email      = @data.email
    window.intercomSettings.created_at = new Date(@data.created_at).getTime()
    window.intercomSettings.widget     =
      activator: '#IntercomDefaultWidget'

    $.getScript '/js/intercom.js', ->

      window.Intercom 'boot', window.intercomSettings

      # console.log 'loaded intercom with settings', window.intercomSettings


    @check_guest_owner()
    app.body.addClass( "logged" ).removeClass( 'not_logged' )
    @emit 'user:logged', @data


    api.user.following ( error, result ) =>
      @data.following = {}

      for item in result
        @data.following[ item ] = true


      @emit 'following:loaded'


  is_following: (id) ->
    log "[User] is following", id, @data.following[id]
    return @data.following[ id ]? and @data.following[ id ]

      

  _dispatch_logout: ->
    log "[====== USER NOT LOGGED =======]"
    log "[==========================]"

    @check_guest_owner()
    app.body.removeClass( "logged" ).addClass( 'not_logged' )
    @emit 'user:unlogged'

  


  ###
  Shortcut Methods
  ###
  has_informations: ->
    if @data and (@data.bio? or @data.location?)
      return true

    return false

  is_logged: ->
    return false if @data is null
    return @data


  ###
  Social Methods
  ###
  

  get_social_info_from_url: ( s ) ->

    # facebook, spotify, soundcloud
    if s.indexOf( 'facebook.com' ) > -1
      social = "facebook"
      title = "facebook"

    else if s.indexOf( 'google' ) > -1
      social = "google"
      title = "google"

    else if s.indexOf( 'tumblr' ) > -1
      social = "tumblr"
      title = "tumblr"

    else if s.indexOf( 'twitter.com' ) > -1
      social = "twitter"
      title = "twitter"

    else if s.indexOf( 'vimeo.com' ) > -1
      social = "vimeo"
      title = "vimeo"

    else if s.indexOf( 'youtube.com' ) > -1
      social = "youtube"
      title = "youtube"

    else if s.indexOf( 'spotify.com' ) > -1
      social = "spotify"
      title = "spotify"

    else if s.indexOf( 'soundcloud.com' ) > -1
      social = "soundcloud"
      title = "soundcloud"

    else
      social = "generic"
      title = "user link"

    return {
      social: social
      title: title
      value: s
    }

  string_to_social_data: ( data ) ->
    data = data.split ','
    output = []
    for item in data
      output.push @get_social_info_from_url( item )

    return output


  social_data_to_string: ( data ) ->
    output = []
    for item in data
      output.push item.value

    return output.join ','


  get_info: ->


    if @data
      data = 
        _id      : @data._id
        socket_id: @socket_id
        info:
          username : @data.username
          name     : @data.name
          avatar   : @data.images.chat_sidebar
    else
      data = 
        _id      : @socket_id
        socket_id: @socket_id
        info:
          username : "guest"
          name     : "Guest"

    return data

  ###
  Session (cookie) Methods 
  ###
  fetch_from_session: ->
    @data = app.session.get 'user', null

    log "[User] fetch_from_session", @data
    if @data and not @data.images?
      @create_images()

  write_to_session:  ->
    # log "[User] writing to session", @data
    app.session.set 'user', @data
    @emit 'user:updated', @data

  delete_session: ->
    # unsubscribe will automatically stop listening and remove all the listeners for this channel
    if @data._id
      socket.unsubscribe @data._id

    @data = null
    app.session.delete 'user'
# will always export the same instance
module.exports = new UserController