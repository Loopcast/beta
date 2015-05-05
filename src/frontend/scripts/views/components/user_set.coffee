api    = require 'app/api/loopcast/loopcast'
notify = require 'app/controllers/notify'

module.exports = ( dom ) ->
  settings_handler = null
  edit_modal       = null
  room_id          = dom.data 'room-id'
  init = ->
    dom.find( '.download_button' ).on 'click', _download
    dom.find( '.edit_button' ).on 'click', _edit
    dom.find( '.delete_button' ).on 'click', _to_delete

    dom.find( '.confirm_delete' ).on 'click', _confirm_delete
    dom.find( '.cancel_delete' ).on 'click', _cancel_delete
    dom.find( '.set_public' ).on 'click', _set_public
    view.once 'binded', _on_views_binded

  _on_views_binded = ->
    settings_handler = view.get_by_dom dom.find( '.settings_button' )
    edit_modal = view.get_by_dom $( '#room_modal' )

  _download = ->
    log "[Set] download"

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
    log "[Set] delete"
    dom.slideUp()

  _set_public = ->
    api.rooms.update room_id, is_public: true, (error, response) =>

      if error
        log "[PublishModal] error", error
        notify.error "There was an error. Try later."
      else
        notify.info "The room now is public!"
        dom.addClass 'public'


  init()