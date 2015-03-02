require 'vendors/jquery-textext/js/textext.core.js'
require 'vendors/jquery-textext/js/textext.plugin.tags.js'
require 'vendors/jquery-textext/js/textext.plugin.autocomplete.js'
require 'vendors/jquery-textext/js/textext.plugin.ajax.js'
require 'vendors/jquery-textext/js/textext.plugin.prompt.js'

module.exports = class EditableTags
  constructor: ( @dom ) ->
    log "EditableTags"
    @dom.find( 'textarea' )
      .textext( 
        plugins : 'tags autocomplete' 
        prompt  : 'Add one...',
      )