login_popup = require 'app/utils/login_popup'
L           = require 'app/api/loopcast/loopcast'
user        = require 'app/controllers/user'
ChatView    = require 'app/views/room/chat_view'
StringUtils = require 'app/utils/string'

module.exports = class Textarea extends ChatView

  already_liked: false
  liked: false

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id
  
  
    @dom.on 'keyup', @on_key_up

    if app.settings.browser.mobile
      @dom.on 'blur', (e) =>
        if e.relatedTarget is null
          @enter_pressed()


    @heart = @dom.parent().find '.ss-heart'

    @heart.on 'click', @like_cliked

    if app.settings.room_to_like
      app.settings.room_to_like = null
      @like_cliked()

    if app.settings.message_to_send
      if user.is_logged()
        @send_message app.settings.message_to_send
      app.settings.message_to_send = null


    @check_room_liked()    

  check_room_liked: ->
    if user.is_logged()
      L.rooms.info @room_id, (error, response) =>
        if response.liked
          @heart.addClass 'liked'
          @liked = true 
        else
          @heart.removeClass 'liked'
          @liked = false


  like_cliked: =>
    if user.is_logged()

      @liked = not @liked

      if @liked
        
        if not @already_liked
          @send_message "Liked this session", {like: @liked}
          @already_liked = true

        @heart.addClass 'liked'
        L.rooms.like @room_id, (error, response) =>

      else
        @heart.removeClass 'liked'
        L.rooms.dislike @room_id, (error, response) =>


    else
      app.settings.room_to_like = true
      app.settings.after_login_url = location.pathname
      do login_popup    

  on_key_up: ( e ) =>
    return if e.keyCode isnt 13
    # when pressing enter
    # grabs the message
    @enter_pressed()

  enter_pressed: ->
    message = StringUtils.trim @dom.val()

    log "[Textarea] enter_pressed", message
    # clear the field
    @dom.val ""


    if user.is_logged()
      @send_message message
    else
      app.settings.message_to_send = message
      app.settings.after_login_url = location.pathname
      do login_popup


  send_message: ( message, payload = {} ) ->

    if app.settings.touch_device
      document.activeElement.blur()
      
    data = 
      room_id : @room_id
      message : message
      payload : payload

    # log "[Textarea] send_message", data

    L.chat.message data, ( error, response ) ->

      if error

        console.error "sending message: ", error
        return

      # console.log "got response", response

  destroy: ->
    @dom.off 'keyup'