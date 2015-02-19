EditableText = require "./editable_text"

module.exports = class EditableSelect extends EditableText


	constructor: ( @dom ) ->
		super @dom

	on_ready: ( html ) =>
		@dom.append html

		text = @dom.find '.text'
		select = @dom.find 'select'

		select.on 'change', (e)->
			t = this.options[e.target.selectedIndex].text
			log "text", t
			text.text t

	get_template: ( callback ) ->
		$.get '/api/v1/occupations/all', (data) ->
			tmpl = require 'templates/components/editables/editable_select'

			log "get_template", data

			callback tmpl( values: data )

