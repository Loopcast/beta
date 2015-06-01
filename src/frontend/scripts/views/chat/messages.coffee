transform = require 'lib/cloudinary/transform'
ChatView = require 'app/views/room/chat_view'
user = require 'app/controllers/user'
api = require 'app/api/loopcast/loopcast'

module.exports = class Messages extends ChatView
  first_message: true

  users : {}
    
  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @tmpl = require 'templates/chat/chat_message'

    @chat = $ '.chat_content'

    @dom.on 'mouseover', '.img_wrapper_2', @on_people_over
    @dom.on 'mouseout', '.img_wrapper_2', @on_people_out

    @popup = view.get_by_dom '.chat_user_popup'


    api.chat.messages @room_id, (error, response) =>
      log "[Messages] old messages", response
      return if error
      response = response.reverse()
      for m in response
        @on_message m
    # log "[Messages] on_room_created", @room_id

  on_people_over: (e) =>
    t = $(e.currentTarget)
    user = t.data 'username'
    if @users[user]?
      user_data = @users[user]

      @popup.show user_data, t
    log "[Messages] on_people_over", user_data


  on_people_out: (e) =>
    @popup.hide()

  on_message: (data) =>
    log "got data!!!", data

    if not @users[data.username]?
      @users[data.username] = 
        avatar: data.avatar
        id: data.username
        images: transform.all data.avatar
        name: data.name
        url: "/#{data.username}"
        username: data.username

      if not data.occupation
        @users[data.username].followers = 0
        @users[data.username].occupation = [ "Occupation" ]


    if @first_message
      @dom.removeClass 'no_chat_yet'
      @first_message = false

    obj =
      message: data.message
      time: data.time
      user: 
        url: "/" + data.username
        name: data.name
        thumb: transform.chat_thumb( data.avatar )
        author: @owner_id is data.username 
        username: data.username

    if data.additional_data? and data.additional_data.like
      obj.like = true

    html = @tmpl obj
      

    h = $(html)
    @dom.append h

    delay 10, -> h.addClass 'show'


    # scroll to the bottom
    @chat.scrollTop @chat[0].scrollHeight
