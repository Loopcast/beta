transform = require 'lib/cloudinary/transform'
api       = require 'api/loopcast/loopcast'


module.exports = class PopupTrigger 


  data: 
    avatar: "https://res.cloudinary.com/hrrdqnsfe/image/upload/v1445351815/213f5b71bb8599b37b16aaeb3a49f175.jpg"
    id: "562651875b18738b152ad6a8"
    name: "Stefano Ortisi (temp)"
    occupation: [ "Producer (temp)" ]
    likes: 0

  constructor: (@dom) ->
    view.on 'binded', @_on_views_binded
    log "[PopupTrigger] user id", @dom.data( 'user-id' )


  _on_views_binded : (scope) =>
    return if not scope.main
    view.off 'binded', @_on_views_binded
    @popup = view.get_by_dom '.chat_user_popup'
    
    # @data = 
    #   avatar: document.getElementById( 'owner_avatar' ).value
    #   id: document.getElementById( 'owner_id' ).value
    #   name: document.getElementById( 'owner_name' ).value
    #   username: document.getElementById( 'owner_username' ).value
      
    #   likes: document.getElementById( 'owner_followers' ).value
    #   occupation:[document.getElementById( 'owner_occupation' ).value]

    log "[PopupTrigger] data", @data




    @data.images = transform.all @data.avatar
    @data.url = "/" + @data.username

    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out

  _on_people_over: =>
    @popup.show @data, @dom

  _on_people_out: =>
    log "people out"
    @popup.hide()


  destroy: ->
    @popup = null
    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out