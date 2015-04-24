EditableText = require "./editable_text"

module.exports = class EditableSelect extends EditableText

	default_text: String

	constructor: ( @dom ) ->
		super @dom
		@dom.addClass 'editable_select'

		@current_value = @dom.data 'text'
		@default_state = @dom.data 'default-selected'


	on_ready: ( html ) =>
		@dom.append html

		@text = @dom.find '.text'
		@select = @dom.find 'select'

		# Set default text
		@default_text = @text.html()
		@select.find(".default_value").html @default_text

		ref = @
		@select.on 'change', (e) ->
			t = this.options[e.target.selectedIndex].text
			v = this.options[e.target.selectedIndex].value

			ref.default_state = v.length <= 0
			ref.update_text t




		# Check if the initial value is not the default
		if not @default_state
			@update_text @current_value, true


	update_text: ( str, silent = false ) ->
		# log "[EditableSelect] update_text", str, @default_state
		@text.text str
		@dom.data 'text', str
		@dom.data 'default-selected', @default_state

		if not silent
			@emit 'changed', 
				value: str
				default_state: @default_state

	get_current_value: ->
		if @default_state
			return ""
		else
			return @text.text()


	get_template: ( callback ) ->
		$.get '/api/v1/occupations', (data) ->
			tmpl = require 'templates/components/editables/editable_select'

			callback tmpl( values: data )

	close_read_mode : => # empty

	destroy: ->
		@select.off 'change'
		@select = null

		super()


