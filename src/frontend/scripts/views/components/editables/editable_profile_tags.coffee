EditableText = require "./editable_text"
user = require 'app/controllers/user'

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
    # log "[EditableProfileTags] text", t.length
    if t.length > 0
      @data = t.split ', '
      @tags.add_tags @data

      @default_state = off
    else
      @empty_text.show()
      @default_state = on

    @text.on 'click', @open_edit_mode
    @empty_text.on 'click', @open_edit_mode

    @tags.on 'change', (@data)=>
      if @data.length > 1 or @data[0].length > 0
        @default_state = off
      else
        @default_state = on
      
      # @emit 'changed', default_state: @default_state


  open_edit_mode: (e) =>
    # return unless app.body.hasClass( 'write_mode' )
    return if not user.check_guest_owner()
    e?.stopPropagation()
    # log 'open_edit_mode'
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

    @emit 'changed', @get_current_value()

    app.window.off 'body:clicked', @close_read_mode


  get_template: ( callback ) ->
    $.get '/api/v1/occupations', (data) ->
      tmpl = require 'templates/components/editables/editable_profile_tags'

      callback tmpl( values: data )

  get_current_value: ->
    if @default_state
      return []
    else
      return @data

  destroy: ->
    @text.off 'click', @open_edit_mode
    @empty_text.off 'click', @open_edit_mode
    super()


