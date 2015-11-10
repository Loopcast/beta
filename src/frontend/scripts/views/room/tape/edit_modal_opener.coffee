api       = require 'app/api/loopcast/loopcast'

module.exports = class EditModalOpener
  edit_modal: null
  id: null
  type: 'tape'
  constructor: (@dom) ->
    view.on 'binded', @on_views_binded
    @id = @dom.data 'id'
    if @dom.data( 'type' )?
      @type = @dom.data( 'type' )

    

  on_views_binded: ( scope ) =>
    return if not scope.main
    view.off 'binded', @on_views_binded

    @edit_modal = view.get_by_dom $( '#room_modal' )

    @dom.on 'click', @open_edit_modal
    log "[EditModalOpener] on_views_binded", @edit_modal


  open_edit_modal: =>
    log "[EditModalOpener] open_edit_modal", @id

    @edit_modal.on 'submit', @on_edit_modal_submit
    @edit_modal.dom.data( 'modal-close', true )


    app.rooms.info @id, @type, (response) =>

      data = @normalize_data response
      log "[EditModalOpener] info", response, data

      # Check the is_live flag
      @edit_modal.open_with_data data

  normalize_data: ( data ) ->
    if data.type is 'room'
      room = data.data.room
      output = 
        is_live: true
        title: room.info.title
        genres: room.info.genres
        about: room.info.about
        location: room.info.location
        public: true
        cover_url: room.info.cover_url  
    else
      tape = data.data.tape
      output = 
        is_live: false
        title: tape.title
        genres: tape.genres
        about: tape.about
        location: tape.location
        public: tape.public
        cover_url: tape.cover_url  

    output.cover_url ?= "/images/default_room_cover.jpg" 

    return output

  normalize_data_for_update: ( data ) ->

    data.genres = data.genres.split ','
    if @type is 'tape'
      output = data
    else
      output = 
        title     : data.title
        location  : data.location
        about     : data.about
        cover_url : data.cover
        genres    : data.genres
        is_public : true



    return output

  on_edit_modal_submit: (data) =>

    
    to_submit = @normalize_data_for_update data
    key = if @type is 'room' then 'rooms' else 'tapes'

    log "[EditModalOpener] _on_edit_submit", data, to_submit

    api[key].update @id, to_submit, (error, response) =>
      log "[EditModalOpener] updated", error, response

    @edit_modal.hide_message()
    @edit_modal.show_loading()

    @edit_modal.close()

    @edit_modal.off 'submit', @on_edit_modal_submit

    

  destroy: ->
    if @edit_modal?
      @dom.off 'click', @open_edit_modal
      @edit_modal.off? 'submit', @on_edit_modal_submit