api       = require 'app/api/loopcast/loopcast'

module.exports = class EditModalOpener
  edit_modal: null
  id: null
  constructor: (@dom) ->
    view.on 'binded', @on_views_binded
    @id = @dom.data 'id'

    

  on_views_binded: ( scope ) =>
    return if not scope.main
    view.off 'binded', @on_views_binded

    @edit_modal = view.get_by_dom $( '#room_modal' )
    @edit_modal.on 'submit', @on_edit_modal_submit
    @edit_modal.dom.data( 'modal-close', true )

    @dom.on 'click', @open_edit_modal
    log "[EditModalOpener] on_views_binded", @edit_modal


  open_edit_modal: =>

    app.rooms.info @id, false, (data) =>
      log "[EditModalOpener] info", data, data.data.tape.genres, data.data.tape.genres.length

      @edit_modal.open_with_data 
        is_live: false
        title: data.data.tape.title
        genres: data.data.tape.genres
        about: data.data.tape.about
        location: data.data.tape.location
        public: data.data.tape.public
        cover_url: data.data.tape.cover_url

  on_edit_modal_submit: (data) =>
    log "[EditModalOpener] _on_edit_submit", data

    data.genres = data.genres.split ','
    api.tapes.update @id, data, (error, response) =>
      log "[EditModalOpener] updated", error, response

    @edit_modal.hide_message()
    @edit_modal.show_loading()

    @edit_modal.close()

    return 
    # log "[User Set] edit submitted", data
    data.cover_url = data.cover


    # Update UI
    dom.find( '.session_title a' ).html data.title
    dom.find( '.location .text' ).html data.location

    genres = data.genres.split ','
    genres_dom = dom.find( '.genres' )
    str = ''


    # Show only the first 5 tags
    max = 5
    counter = 0
    for genre in genres
      klass = if counter++ >= max then "hide" else ""
      str += "<a class='tag #{klass}' href='#' title='#{genre}'>#{genre}</a>"

    if genres.length > max
      str += '...'

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

    api.tapes.update room_id, to_save, (error, response) ->
      log "[User set] save response", error, response
      edit_modal.close()

  destroy: ->
    if @edit_modal?
      @dom.off 'click', @open_edit_modal
      @edit_modal.off 'submit', @on_edit_modal_submit