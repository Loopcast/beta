require 'happens'
require 'vendors/jquery-textext/js/textext.core.js'
require 'vendors/jquery-textext/js/textext.plugin.tags.js'
require 'vendors/jquery-textext/js/textext.plugin.autocomplete.js'
require 'vendors/jquery-textext/js/textext.plugin.ajax.js'
require 'vendors/jquery-textext/js/textext.plugin.prompt.js'

module.exports = class EditableTags
  current_data: []

  constructor: ( @dom ) ->

    happens @
    log "EditableTags"

    @dom.find( 'textarea' )
      .textext( 
        plugins : 'tags autocomplete prompt' 
        prompt  : 'Add genre...',
      )
      .bind( 'getSuggestions', @get_suggestions )
      .bind( 'getFormData', @on_data_change )
      .bind( 'keyup', (e) ->

        # Adding tag on "," key pressed
        if e.keyCode is 188
          space_comma = $(this).val().replace(/\s/g,"").replace(',','')
          $(this).textext()[0].tags().addTags([ space_comma ])
          $(this).val('');
      )
        

    @tags_plugin = @dom.find( 'textarea' ).textext()[0].tags()
    @hidden = @dom.find( 'input[type=hidden]')


  get_suggestions: ( e, data ) ->
    list = [
        'Basic'
        'Closure'
        'Cobol'
        'Delphi'
        'Erlang'
        'Fortran'
        'Go'
        'Groovy'
        'Haskel'
        'Java'
        'JavaScript'
        'OCAML'
        'PHP'
        'Perl'
        'Python'
        'Ruby'
        'Scala'
      ]
      textext = $(e.target).textext()[0]
      query = (if data then data.query else '') or ''
      $(this).trigger 'setSuggestions', result: textext.itemManager().filter(list, query)

  on_data_change: ( e, data ) =>
    if @current_data.length isnt data[200].form.length
      @current_data = data[200].form
      @emit 'change', @current_data

  add_tags: ->
    tags = [ "One", "Two", "Three" ]

    @tags_plugin.addTags tags

  get_tags: -> @current_data