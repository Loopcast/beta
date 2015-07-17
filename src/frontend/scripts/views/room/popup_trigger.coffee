transform = require 'lib/cloudinary/transform'

module.exports = class PopupTrigger 
  constructor: (@dom) ->
    view.on 'binded', @_on_views_binded

  _on_views_binded : (scope) =>
    return if not scope.main
    view.off 'binded', @_on_views_binded
    @popup = view.get_by_dom '.chat_user_popup'
    
    @data = 
      avatar: document.getElementById( 'owner_avatar' ).value
      id: document.getElementById( 'owner_id' ).value
      name: document.getElementById( 'owner_name' ).value
      likes: document.getElementById( 'owner_followers' ).value
      occupation:[document.getElementById( 'owner_occupation' ).value]

    
    @data.images = transform.all @data.avatar
    @data.url = "/" + @data.id

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