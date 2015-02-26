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
    edit_modal = view.get_by_dom $( '#createroom_modal' )

  _download = ->
    log "[Set] download"

  _edit = ->
    log "[Set] edit"
    edit_modal.open()

  _to_delete = ->
    dom.addClass 'to_delete'
    settings_handler.close()

  _cancel_delete = ->
    dom.removeClass 'to_delete'

  _confirm_delete = ->
    log "[Set] delete"
    dom.slideUp()

  init()