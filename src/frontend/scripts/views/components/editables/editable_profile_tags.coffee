EditableText = require "./editable_text"

module.exports = class EditableProfileTags extends EditableText

  constructor: ( @dom ) ->
    super @dom
    @dom.addClass 'editable_profile_tags'
    @text = @dom.find '.text.values'
    @empty_text = @dom.find '.text.empty'
    

  on_ready: ( html ) =>
    @dom.append html

    view.once 'binded', @on_binded
    view.bind @dom

  on_binded: =>

    @tags = view.get_by_dom @dom.find( '.tags_wrapper' )

    t = @text.html()
    log "[EditableProfileTags] text", t.length
    if t.length > 0
      list = t.split ', '
      @tags.add_tags list
    else
      @empty_text.show()

    @text.on 'click', @open_edit_mode
    @empty_text.on 'click', @open_edit_mode


  open_edit_mode: (e) =>
    return unless app.body.hasClass( 'write_mode' )

    e?.stopPropagation()
    log 'open_edit_mode'
    @empty_text.hide()
    @dom.addClass 'edit_mode'

    app.window.on 'body:clicked', @close_read_mode

  close_read_mode : =>
    @dom.removeClass 'edit_mode'
    list = @tags.get_tags()

    if list.length is 0 or list[ 0 ].length is 0
      @empty_text.show()
      @text.html ""
    else
      @text.html list.join( ', ' )

    app.window.off 'body:clicked', @close_read_mode


  get_template: ( callback ) ->
    $.get '/api/v1/occupations/all', (data) ->
      tmpl = require 'templates/components/editables/editable_profile_tags'

      callback tmpl( values: data )

  destroy: ->
    @text.off 'click', @open_edit_mode
    @empty_text.off 'click', @open_edit_mode
    super()


