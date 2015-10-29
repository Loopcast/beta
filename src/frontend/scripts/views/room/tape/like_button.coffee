send_message = require 'app/utils/rooms/tape/send_message'
login_popup = require 'app/utils/login_popup'
StringUtils = require 'app/utils/string'
L           = require 'app/api/loopcast/loopcast'
user        = require 'app/controllers/user'
LoggedView  = require 'app/views/logged_view'

module.exports = class LikeButton extends LoggedView
  tape_id   : null
  liked     : false
  num_likes : 0 
  logged    : false

  constructor: ( @dom ) ->
    super()
    @tape_id       = @dom.data 'tape-id'
    @counter       = @dom.find '.label' 
    @icon          = @dom.find '.icon' 

    @icon.on 'click', @toggle_like
    log "[LikeButton]", @tape_id
    
    

  on_views_binded: ( scope ) =>
    super scope

    @tape_view = view.get_by_dom 'div.tape_view'
    @tape_view.on 'like', @on_like

  on_like: ( data ) =>
    log "[LikeButton] on_like", data
    @counter.html ++@num_likes

  like: ->
    return if @liked

    @liked  = true
    @dom.addClass 'liked'
    

    send_message @tape_id, "Liked this session", like: @liked
    L.rooms.like @tape_id, (error, response) =>


  unlike: ->
    return if not @liked

    @liked  = false
    @dom.removeClass 'liked'
    @num_likes = Math.max(0, @num_likes - 1)
    @counter.html @num_likes

    L.rooms.dislike @tape_id, (error, response) =>

  toggle_like: (e) =>

    if user.is_logged()
      if @liked
        @unlike()
      else
        @like()
    else
      app.settings.action = 
        type: 'like_tape'
        data: 
          tape_id: @tape_id
          message: "Liked this session"

      app.settings.room_to_like = true
      app.settings.after_login_url = location.pathname
      do login_popup    

  on_user_logged: ( @user_data ) =>
    return if @logged
    @logged = true
    log "[LikeButton] on_user_logged", @user_data

    # Check if the tape has been already liked by the logged user
    L.tapes.get @tape_id, (error, response) =>
      log "[LikeButton] getting tape info", response
      if not error and response.liked
        @liked  = true
        @dom.addClass 'liked'

    

  on_user_unlogged: =>
    return if not @logged
    log "[LikeButton] on_user_unlogged"
    @logged = false

    @liked  = false
    @dom.removeClass 'liked'
