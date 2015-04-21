transform = require 'app/utils/images/transform'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class Messages extends RoomView
  first_message: true

  constructor: ( @dom ) ->
    super @dom
    
  on_room_created: ( @room_id, @owner_id ) =>
    @tmpl = require 'templates/profile/chat_message'

    @chat = $ '.chat_content'
    
    subscribe_id = "#{@owner_id}.#{@room_id}"

    log "[Messages] on_room_created", @room_id
    log "[Message] subscribing to", subscribe_id
    @channel = pusher.subscribe subscribe_id
    @channel.bind 'message', @on_message


  on_message: (data) =>
    log "got data!!!", data

    if @first_message
      @dom.removeClass 'no_chat_yet'
      @first_message = false


    html = @tmpl
      message: data.message
      time: data.time
      user: 
        url: "/" + data.username
        name: data.name
        thumb: transform.chat_thumb( data.avatar )
        author: @owner_id is data.username 

    @dom.append html

    # scroll to the bottom
    @chat.scrollTop @chat[0].scrollHeight


  destroy: ->
    @channel.unbind 'message', @on_message