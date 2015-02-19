
module.exports = class EditableText
	tmpl_path: 'templates/components/editable_text'

	constructor: ( @dom ) ->
		text = @dom.text()

		@dom.addClass 'editable_text'

		@dom.on 'click', (e) -> e.stopPropagation()

		tmpl = require @tmpl_path

		@dom.append tmpl()

		@input = @dom.find 'input'

		@input.val text

		@text_el = @dom.find '.text'

		# copy style to input

		style = 
			# 'font-size'      : text_el.css 'font-size'
			# 'font-weight'    : text_el.css 'font-weight'
			# 'padding'        : text_el.parent().css 'padding'
			# 'letter-spacing' : text_el.css 'letter-spacing'
			# 'line-height'    : text_el.css 'line-height'
			'color'          : @text_el.css 'color'

		@input.css style

		@text_el.on 'click', @open_edit_mode

		

	close_read_mode : =>
		log 'close_edit_mode'
		@text_el.text @input.val()
		@dom.removeClass 'edit_mode'

		@input.off 'keyup'

	open_edit_mode : (e) =>
		e?.stopPropagation()
		log 'open_edit_mode'
		@dom.addClass 'edit_mode'

		@input.focus().select()
		@input.on 'keyup', (e) =>
			if e.keyCode is 13
				@close_read_mode()

		app.window.once 'body:clicked', @close_read_mode




	

