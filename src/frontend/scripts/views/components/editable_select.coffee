EditableText = require "app/views/components/editable_text"

module.exports = class EditableSelect extends EditableText

	tmpl_path: 'templates/components/editable_select'

	constructor: ( @dom ) ->
		super @dom