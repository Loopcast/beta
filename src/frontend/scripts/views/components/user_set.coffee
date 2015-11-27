api    = require 'app/api/loopcast/loopcast'
notify = require 'app/controllers/notify'
navigation = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'
transform_url = require 'app/utils/rooms/update_room_link_by_username'

module.exports = ( dom ) ->
  settings_handler = null
  edit_modal       = null
  type             = if dom.data( 'type' )? then 'rooms' else 'tapes'
  room_id          = dom.data 'room-id'
  room_url         = dom.find( '.session_title a' ).attr 'href'
  init = ->
    dom.find( '.download_button' ).on 'click', _download
    dom.find( '.delete_button' ).on 'click', _to_delete

    dom.find( '.confirm_delete' ).on 'click', _confirm_delete
    dom.find( '.cancel_delete' ).on 'click', _cancel_delete
    dom.find( '.set_public' ).on 'click', _set_public
    dom.find( '.public_screen .bg' ).on 'click', _get_into_the_room

    user_controller.on 'name:updated', _on_name_updated
    view.once 'binded', _on_views_binded
  
    

  _on_name_updated = (data) ->
    log "name updated", data, dom.find( '.share_wrapper' ), dom.find( '.share_wrapper' ).data( 'permalink' )
    str = document.title.split ' | '
    str[0] = data.name
    document.title = str.join ' | '
    room_url = transform_url room_url, data.username

    dom.find( '.room_url' ).each ->
      $(@).attr 'href', room_url


    dom.find( '.share_wrapper' ).data( 'permalink', room_url )

    dom.find( '.session_author' ).text data.name




  _on_views_binded = ->
    settings_handler = view.get_by_dom dom.find( '.settings_button' )

  _download = ->
    log "[Set] download"

  _get_into_the_room = ->
    log "[Set] _get_into_the_room", room_url

    navigation.go room_url

  _to_delete = ->
    dom.addClass 'to_delete'
    settings_handler.close()

  _cancel_delete = ->
    dom.removeClass 'to_delete'

  _confirm_delete = ->
    
    log "[UserSet] trying to delete ", room_id


    api[type].delete room_id, (error, response) ->
      if error
        log "[UserSet] delete", room_id, error
        notify.error "There was an error. Try later."
        return

      dom.slideUp -> 
        dom.remove()
        delay 1, -> app.emit 'room:deleted', room_id
      
      if type is 'rooms'
        notify.info "The room has been deleted."
      else
        notify.info "The recording has been deleted."



  _set_public = ->

    api.tapes.update room_id, public: true, (error, response) =>

      if error
        log "[PublishModal] error", error
        notify.error "There was an error. Try later."
      else
        notify.info "Recording is now public"
        dom.addClass( 'public' ).removeClass( 'to_publish' )


  init()