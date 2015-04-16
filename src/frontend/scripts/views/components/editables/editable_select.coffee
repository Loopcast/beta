EditableText = require "./editable_text"

module.exports = class EditableSelect extends EditableText


	constructor: ( @dom ) ->
		super @dom
		@dom.addClass 'editable_select'

	on_ready: ( html ) =>
		@dom.append html

		text = @dom.find '.text'
		@select = @dom.find 'select'

		@select.on 'change', (e)->
			t = this.options[e.target.selectedIndex].text
			log "text", t
			text.text t

	get_template: ( callback ) ->
		$.get '/api/v1/occupations/all', (data) ->
			tmpl = require 'templates/components/editables/editable_select'

			callback tmpl( values: data )

	close_read_mode : => # empty

	destroy: ->
		@select.off 'change'
		@select = null

		super()


