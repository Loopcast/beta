happens = require 'happens'
user = require 'app/controllers/user'

module.exports = class EditableText

	default_state : on
	default_text: ""

	constructor: ( @dom ) ->
		happens @

		@dom.addClass 'editable_text'

		@dom.on 'click', (e) -> e.stopPropagation()

		@is_freestyle = @dom.data( 'freestyle' )?

		@get_template @on_ready

	on_ready: ( html ) =>

		text = @dom.text()
		
		@dom.append html

		@input = @dom.find 'input'

		@input.val text

		@text_el = @dom.find '.text'

		# copy style to input

		style = 
			'font-weight'    : @text_el.css 'font-weight'
			'letter-spacing' : @text_el.css 'letter-spacing'
			'line-height'    : @text_el.css 'line-height'
			'color'          : @text_el.css 'color'

		if not @is_freestyle
			style[ 'font-size' ] = '36px'
			style[ 'padding' ] = '4px 10px 10px'

		@input.css style

		@text_el.on 'click', @open_edit_mode

	set_text: ( text ) ->
		@text_el.text text
		@input.val text
	get_template: ( callback ) ->

		tmpl = require 'templates/components/editables/editable_text'
		
		callback tmpl()

	open_edit_mode : (e) =>
		return if not user.check_guest_owner()
		# return unless app.body.hasClass( 'write_mode' )

		e?.stopPropagation()
		log 'open_edit_mode'
		@dom.addClass 'edit_mode'

		@input.focus().select()
		@input.on 'keyup', (e) =>
			if e.keyCode is 13
				@close_read_mode()

		app.window.on 'body:clicked', @close_read_mode

	close_read_mode : =>
		log 'close_edit_mode'
		val = @input.val()
		@emit 'changed', val

		@text_el.text val
		@dom.removeClass 'edit_mode'

		@input.off 'keyup'

		app.window.off 'body:clicked', @close_read_mode


	destroy: ->
		# @text_el.off 'click', @open_edit_mode




	

