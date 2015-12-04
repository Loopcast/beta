Happens         = require 'happens'



module.exports = class UploadPage
  constructor: ( @dom ) ->

    Happens @

    @uploadBoxes = []

    view.once 'binded', @on_views_binded

    # Upload box sample which is used for creating new uploaded boxes
    @sample = @dom.find('#sample-upload-box')                  

    # Create first box
    @addUploadBox()
    

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    elem = @dom.find( '.new-upload-box' )
    box = view.get_by_dom( elem )
    
    unless box 
      return

    elem.removeClass( 'new-upload-box' )
    
    # Create new upload box when upload file si added
    box.on 'addedFile', () =>
      @addUploadBox()

    @uploadBoxes.push( box )


  addUploadBox: () =>
    box = @sample.clone()
                 .removeAttr('id')
                 .addClass('new-upload-box')
                 .appendTo('.upload-page')

    # Replace all data-sample-view with data-view, so they can get binded
    @replaceSampleDataAttr( box )

    box.find('[data-sample-view]').each (index, element) =>
      element = $( element )
      @replaceSampleDataAttr( element )


    delay 2, () ->
      box.removeClass('opaque')

    view.once 'binded', @on_views_binded
    view.bind()


  replaceSampleDataAttr: (elem, oldAttr, newAttr) ->
    value = elem.attr 'data-sample-view'
    elem.removeAttr 'data-sample-view'
    elem.attr 'data-view', value
