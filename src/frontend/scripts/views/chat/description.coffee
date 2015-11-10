EditableText = require 'app/views/components/editables/editable_text'

module.exports = class Description extends EditableText
  max_length: 100
  expanded: false

  