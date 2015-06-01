transform = require 'lib/cloudinary/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'
notify = require 'app/controllers/notify'
api = require 'app/api/loopcast/loopcast'


class UserController

  # Class variables
  instance = null

  # Object variables
  data : null
  is_owner: false


  constructor: ->

    if UserController.instance
      console.error "You can't instantiate this UserController twice" 
      return

    UserController.instance = @
    happens @

    @fetch_from_session()

    view.on 'binded', @on_views_binded 
      

  on_views_binded: ( scope ) =>
    return unless scope.main
    view.off 'binded', @on_views_binded



    api.user.status {}, (error, response) =>
      # log "[User] checking status from the server", error, response.logged
      
      if error or response.logged is false
        @logout()
      else if @is_logged()
        @_dispatch_login()
      else
        @_dispatch_logout()
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
      following  : {}

    log "[UserController] user:logged", @data, data

    @_dispatch_login()
    
    @write_to_session()


    notify.info "You've successufully logged in."

  ###
  Called from the outside, when the user logs out
  ###
  logout: ( callback = -> ) ->

    # log "[UserController] logout"
    
    if not @is_logged() then return callback error: code: 'node_logged'

    # log "[User] trying to logout..."

    $.post '/api/v1/user/logout', {}, (data) =>
      # log "[User] logout ~ success", data
      
      @delete_session()

      @_dispatch_logout()

      notify.info "You've successufully logged out."

      callback?()

  is_me: ( username ) ->
    return username is @data.username

  owner_id: ->
    document.getElementById( 'owner_id' )?.value
    
  check_guest_owner: ->
    owner_id = @owner_id()

    log "user", owner_id
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

  
  ###
  Private Methods
  ###
  _dispatch_login: ->

    @create_images()

    log "[====== USER LOGGED =======]"
    log "#{@data.username} / #{@data.name}"
    log @data
    log "[==========================]"

    # updates intercom information
    window.intercomSettings.name       = @data.name
    window.intercomSettings.email      = @data.email
    window.intercomSettings.created_at = new Date(@data.created_at).getTime()
    window.intercomSettings.widget     =
      activator: '#IntercomDefaultWidget'

    $.getScript 'js/intercom.js', ->

      window.Intercom 'boot', window.intercomSettings

      # console.log 'loaded intercom with settings', window.intercomSettings


    @check_guest_owner()
    app.body.addClass( "logged" ).removeClass( 'not_logged' )
    @emit 'user:logged', @data

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
    return @data


  ###
  Social Methods
  ###
  

  get_social_info_from_url: ( s ) ->

    # facebook, spotify, soundcloud
    if s.indexOf( 'facebook.com' ) > -1
      social = "facebook"
      title = "facebook"

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


  ###
  Session (cookie) Methods 
  ###
  fetch_from_session: ->
    @data = app.session.get 'user', null

    # log "[User] fetch_from_session", @data
    if @data and not @data.images?
      @create_images()

  write_to_session:  ->
    # log "[User] writing to session", @data
    app.session.set 'user', @data
    @emit 'user:updated', @data

  delete_session: ->
    @data = null
    app.session.delete 'user'
# will always export the same instance
module.exports = new UserController