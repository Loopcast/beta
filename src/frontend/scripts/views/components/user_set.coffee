module.exports = ( dom ) ->
  settings_handler = null
  edit_modal       = null

  init = ->
    dom.find( '.download_button' ).on 'click', _download
    dom.find( '.edit_button' ).on 'click', _edit
    dom.find( '.delete_button' ).on 'click', _to_delete

    dom.find( '.confirm_delete' ).on 'click', _confirm_delete
    dom.find( '.cancel_delete' ).on 'click', _cancel_delete

    view.once 'binded', _on_views_binded

  _on_views_binded = ->
    settings_handler = view.get_by_dom dom.find( '.settings_button' )
    edit_modal = view.get_by_dom $( '#room_modal' )

  _download = ->
    log "[Set] download"

  _edit = ->
    settings_handler.close()

    edit_modal.open_with_data dom.data( 'data' )
    edit_modal.once 'submit', _on_edit_submit

  _on_edit_submit = (data) ->

    log "[User Set] edit submitted", data

    # Update UI
    dom.find( '.session_title a' ).html data.title
    dom.find( '.location .text' ).html data.location

    genres = data.genres.split ', '
    genres_dom = dom.find( '.genres' )
    str = ''
    for genre in genres
      str += "<a class='tag' href='#' title='#{genre}'>#{genre}</a>"

    genres_dom.html str


    edit_modal.hide_message()
    edit_modal.show_loading()

    # TODO: Call the api
    delay 1000, ->
      edit_modal.close()


  _to_delete = ->
    dom.addClass 'to_delete'
    settings_handler.close()

  _cancel_delete = ->
    dom.removeClass 'to_delete'

  _confirm_delete = ->
    log "[Set] delete"
    dom.slideUp()


  init()