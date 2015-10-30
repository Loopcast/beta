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

    

  destroy: ->
    if @edit_modal?
      @dom.off 'click', @open_edit_modal
      @edit_modal.off 'submit', @on_edit_modal_submit