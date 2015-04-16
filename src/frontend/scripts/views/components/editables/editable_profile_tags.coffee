EditableText = require "./editable_text"

module.exports = class EditableProfileTags extends EditableText

  constructor: ( @dom ) ->
    super @dom
    @dom.addClass 'editable_profile_tags'
    @text = @dom.find '.text'

  on_ready: ( html ) =>
    @dom.append html

    view.once 'binded', @on_binded
    view.bind @dom

  on_binded: =>

    @tags = view.get_by_dom @dom.find( '.tags_wrapper' )


    list = @text.html().split ', '
    @tags.add_tags list
    @text.on 'click', @open_edit_mode


  open_edit_mode: (e) =>
    return unless app.body.hasClass( 'write_mode' )

    e?.stopPropagation()
    log 'open_edit_mode'
    @dom.addClass 'edit_mode'

    app.window.on 'body:clicked', @close_read_mode

  close_read_mode : =>
    @dom.removeClass 'edit_mode'
    list = @tags.get_tags()
    @text.html list.join( ', ' )

    app.window.off 'body:clicked', @close_read_mode


  get_template: ( callback ) ->
    $.get '/api/v1/occupations/all', (data) ->
      tmpl = require 'templates/components/editables/editable_profile_tags'

      callback tmpl( values: data )


