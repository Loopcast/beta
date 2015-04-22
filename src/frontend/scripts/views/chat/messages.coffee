transform = require 'shared/transform'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class Messages extends RoomView
  first_message: true
    
  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @tmpl = require 'templates/chat/chat_message'

    @chat = $ '.chat_content'

    # log "[Messages] on_room_created", @room_id


  on_message: (data) =>
    # log "got data!!!", data

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

    if data.additional_data? and data.additional_data.like
      obj.like = true

    html = @tmpl obj
      

    h = $(html)
    @dom.append h

    delay 10, -> h.addClass 'show'


    # scroll to the bottom
    @chat.scrollTop @chat[0].scrollHeight
