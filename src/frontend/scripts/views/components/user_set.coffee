api    = require 'app/api/loopcast/loopcast'
notify = require 'app/controllers/notify'
navigation = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'
transform_url = require 'app/utils/rooms/update_room_link_by_username'

module.exports = ( dom ) ->
  settings_handler = null
  edit_modal       = null
  room_id          = dom.data 'room-id'
  room_url         = dom.find( '.session_title a' ).attr 'href'
  init = ->
    dom.find( '.download_button' ).on 'click', _download
    dom.find( '.edit_button' ).on 'click', _edit
    dom.find( '.delete_button' ).on 'click', _to_delete

    dom.find( '.confirm_delete' ).on 'click', _confirm_delete
    dom.find( '.cancel_delete' ).on 'click', _cancel_delete
    dom.find( '.set_public' ).on 'click', _set_public
    dom.find( '.public_screen .bg' ).on 'click', _get_into_the_room

    user_controller.on 'name:updated', _on_name_updated
    view.once 'binded', _on_views_binded

    log room_url

  _on_name_updated = (data) ->
    log "name updated", data.username, dom.find( '.share_wrapper' ), dom.find( '.share_wrapper' ).data( 'permalink' )

    room_url = transform_url room_url, data.username

    dom.find( '.room_url' ).each ->
      $(@).attr 'href', room_url


    dom.find( '.share_wrapper' ).data( 'permalink', room_url )

    dom.find( '.session_author' ).text data.name




  _on_views_binded = ->
    settings_handler = view.get_by_dom dom.find( '.settings_button' )
    edit_modal = view.get_by_dom $( '#room_modal' )
    edit_modal.dom.data( 'modal-close', true )

  _download = ->
    log "[Set] download"

  _get_into_the_room = ->
    log "[Set] _get_into_the_room", room_url

    navigation.go room_url

  _edit = ->
    settings_handler.close()

    edit_data = 
      title: dom.find( '.session_title' ).text().trim()
      genres: []

    g = dom.find '.genres a'
    for item in g
      edit_data.genres.push $(item).text().trim()


    edit_modal.open_with_data edit_data
    edit_modal.once 'submit', _on_edit_submit

  _on_edit_submit = (data) ->

    # log "[User Set] edit submitted", data
    data.cover_url = data.cover


    # Update UI
    dom.find( '.session_title a' ).html data.title
    dom.find( '.location .text' ).html data.location

    genres = data.genres.split ','
    genres_dom = dom.find( '.genres' )
    str = ''
    for genre in genres
      str += "<a class='tag' href='#' title='#{genre}'>#{genre}</a>"

    genres_dom.html str


    edit_modal.hide_message()
    edit_modal.show_loading()

    edit_modal.close()

    to_save = {}

    if data.title.length > 0
      to_save.title = data.title.trim()

    if data.genres.length > 0
      to_save.genres = data.genres.split ','

    if edit_modal.cover_uploaded.length > 0
      to_save.cover_url = data.cover

    log "[User Set] saving", to_save, data

    api.rooms.update room_id, to_save, (error, response) ->
      edit_modal.close()


  _to_delete = ->
    dom.addClass 'to_delete'
    settings_handler.close()

  _cancel_delete = ->
    dom.removeClass 'to_delete'

  _confirm_delete = ->
    
    api.rooms.delete room_id, (error, response) ->
      if error
        log "[UserSet] delete", room_id, error
        # notify.error "There was an error. Try later."
        return

      dom.slideUp -> 
        dom.remove()
        delay 1, -> app.emit 'room:deleted', room_id
        
      notify.info "The recording has been deleted."



  _set_public = ->
    api.rooms.update room_id, is_public: true, (error, response) =>

      if error
        log "[PublishModal] error", error
        notify.error "There was an error. Try later."
      else
        notify.info "Recording is now public"
        dom.addClass( 'public' ).removeClass( 'to_publish' )


  init()