require 'happens'
require 'vendors/jquery.autocomplete.min.js'
require 'vendors/jquery.tagsinput.js'

module.exports = class EditableTags
  current_data: []

  constructor: ( @dom ) ->

    happens @

    list = [
      "House",
      "Tech House",
      "Electro House",
      "Ambient",
      "Alternative",
      "Experimental",
      "Reggae",
      "Ska",
      "Fusion",
      "Funky",
      "Punk",
      "Metal"
      ]

    @dom.tagsInput 
      width:'auto'
      height: 'auto'
      onAddTag: @on_add_tag
      onRemoveTag: @on_remove_tag
      autocomplete_url: list
      autocomplete: 
        width: 200

    
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

  destroy: ->
    log "[EditableTags] destroy"
    @dom.destroy_tagsinput()
    @on            = null
    @off           = null
    @once          = null
    @emit          = null
    @on_add_tag    = null
    @on_remove_tag = null
    @dom           = null
    # super()