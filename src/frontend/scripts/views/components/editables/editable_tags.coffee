require 'happens'
require 'vendors/jquery.autocomplete.min.js'
require 'vendors/jquery.tagsinput.js'

L = require '../../../api/loopcast/loopcast'

module.exports = class EditableTags
  current_data: []
  ready: false

  constructor: ( @dom ) ->

    happens @

    L.genres.all ( error, list ) =>
      
      @dom.tagsInput 
        width:'auto'
        height: 'auto'
        onAddTag: @on_add_tag
        onRemoveTag: @on_remove_tag
        autocomplete_url: list
        defaultText: "Add new"
        autocomplete: 
          width: 200

      delay 10, =>
        @ready = true
        @emit 'ready'

        @input = @dom.next().find 'input'
        @input.on 'focusout', @on_focusout

    
  populate_tags: ( list ) ->

  on_focusout: =>
    t = @input.val() 
    if t.length > 0
      @add_tags [t]
    
    

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
    @input.off 'focusout', @on_focusout
    @dom.destroy_tagsinput()
    @on            = null
    @off           = null
    @once          = null
    @emit          = null
    @on_add_tag    = null
    @on_remove_tag = null
    @dom           = null

    # super()