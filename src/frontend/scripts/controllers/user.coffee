transform = require 'app/utils/images/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'
notify = require 'app/controllers/notify'


class UserController

  # Class variables
  instance = null
  USER_DEFAULT_AVATAR = "/images/profile-1.jpg"
  USER_DEFAULT_COVER = "/images/homepage.jpg"

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

    view.once 'binded', (scope) =>  
      return unless scope.main

      if @is_logged()
        @_dispatch_login()
      else
        @_dispatch_logout()

  ###
  Called from the outside, when the user logs in
  ###
  login: ( @data ) ->

    log "[UserController] user:logged", @data

    @create_images()

    @write_to_session()

    @_dispatch_login()

    notify.info "You've successufully logged in."

  ###
  Called from the outside, when the user logs out
  ###
  logout: ( callback = -> ) ->

    # log "[UserController] logout"
    
    if not @is_logged() then return callback error: code: 'node_logged'

    # log "[User] trying to logout..."

    $.post '/api/v1/logout', {}, (data) =>
      # log "[User] logout ~ success", data
      
      @delete_session()

      @_dispatch_logout()

      navigation.go '/'

      notify.info "You've successufully logged out."

      callback?()

  owner_id: ->
    document.getElementById( 'owner_id' )?.value
    
  check_guest_owner: ->
    owner_id = @owner_id()

    log "[User] check owner_id", owner_id
    if owner_id? and @is_logged() and @data.username is owner_id
      app.body.addClass( 'is_owner' ).removeClass( 'is_guest' )
      @is_owner = true
    else
      app.body.removeClass( 'is_owner' ).addClass( 'is_guest' )
      @is_owner = false

  create_images: ->

    console.log "[UserController] NORMALIZE DATA before", @data
    
    if not @data.avatar?
      log "[User Controller] user.avatar is undefined. Setting default."
      @data.avatar = UserController.USER_DEFAULT_AVATAR

    # if not @data.cover?
    #   log "[User Controller] user.cover is undefined. Setting default."
    #   @data.cover = UserController.USER_DEFAULT_COVER

    console.log "[UserController] NORMALIZE DATA after", @data

    @data.images =
      top_bar: transform.top_bar @data.avatar
      avatar: transform.avatar @data.avatar
      cover: transform.cover @data.cover

    @emit 'user:updated', @data
  
  ###
  Private Methods
  ###
  _dispatch_login: ->
    log "[====== USER LOGGED =======]"
    log "#{@data.username} / #{@data.name}"
    log @data
    log "[==========================]"


    @check_guest_owner()
    app.body.addClass "logged"
    @emit 'user:logged', @data

  _dispatch_logout: ->
    log "[====== USER NOT LOGGED =======]"
    log "[==========================]"

    @check_guest_owner()
    app.body.removeClass "logged"
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
  Session (cookie) Methods 
  ###
  fetch_from_session: ->
    @data = app.session.get 'user', null

  write_to_session:  ->
    app.session.set 'user', @data

  delete_session: ->
    @data = null
    app.session.delete 'user'
# will always export the same instance
module.exports = new UserController