EditableText = require "./editable_text"

module.exports = class EditableSelect extends EditableText


	constructor: ( @dom ) ->
		super @dom

	get_template: ( callback ) ->
		$.get '/api/v1/occupations/all', (data) ->
			tmpl = require 'templates/components/editables/editable_select'

			log "get_template", data

			callback tmpl( values: data )

