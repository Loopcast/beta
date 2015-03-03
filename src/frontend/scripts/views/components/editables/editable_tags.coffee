require 'happens'
require 'vendors/jquery.autocomplete.min.js'
require 'vendors/jquery.tagsinput.js'

module.exports = class EditableTags
  current_data: []

  constructor: ( @dom ) ->

    happens @

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

    @dom.tagsInput 
      width:'auto'
      height: 'auto'
      onAddTag: @on_add_tag
      onRemoveTag: @on_remove_tag
      autocomplete_url: list

    
  populate_tags: ( list ) ->
    
    

  on_add_tag: ( tag ) =>
    log "[EditableTags] on_add_tag", tag
    @emit 'change', @get_tags()


  on_remove_tag: ( tag ) =>
    log "[EditableTags] on_remove_tag", tag
    @emit 'change', @get_tags()

  get_tags: ( as_string = false ) -> 
    if as_string
      @dom.val()
    else
      @dom.val().split(',')

  add_tags: (tags)->
    for t in tags
      @dom.addTag t + "", { focus:true, unique:true }

  # get_tags: -> @current_data