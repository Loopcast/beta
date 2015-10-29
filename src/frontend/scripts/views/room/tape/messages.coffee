require 'app/utils/time/livestamp'
transform   = require 'lib/cloudinary/transform'
user        = require 'app/controllers/user'
api         = require 'app/api/loopcast/loopcast'
autolink    = require 'lib/tools/strings/autolink'

module.exports = class Messages
  tape_id: null
  users : {}

  constructor: ( @dom ) ->
    @tape_id       = @dom.data 'tape-id'

    @tmpl = require 'client_templates/chat/tape_message'

    api.chat.messages @tape_id, (error, response) =>
      log "[Messages] old messages", response
      return if error
      response = response.reverse()
      for m in response
        @on_message m

    view.on 'binded', @on_views_binded
    

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    @tape_view = view.get_by_dom 'div.tape_view'
    @tape_view.on 'message', @on_message

  on_message: (data) =>
    

    if not @users[data.username]?
      @users[data.username] = 
        avatar: data.avatar
        id: data.username
        images: transform.all data.avatar
        name: data.name
        url: "/#{data.username}"
        username: data.username

      if not data.occupation
        # @users[data.username].followers = 0
        @users[data.username].occupation = [ "Occupation" ]

    obj =
      message: autolink( data.message )
      time: data.time
      user: 
        url: "/" + data.username
        name: data.name
        thumb: transform.avatar( data.avatar )
        author: @owner_id is data._id
        username: data.username

    if data.payload?.like
      obj.like = true

    log "[Messages] on_message", data, @owner_id, obj

    html = @tmpl obj
      
    # @increment_title() if @onfocused

    h = $(html)
    @dom.prepend h

    delay 10, -> h.addClass 'show'

  destroy: ->
    @tape_view?.off 'message', @on_message
    @tape_view = null