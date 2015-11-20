module.exports = class UploadPage
  constructor: ( @dom ) ->

<<<<<<< 9681415d32a8ee7b8932a435322b16eb3c47f937
    console.log 'uplaod page inited'
=======
    @dropZone = @dom.find('.drag-and-drop')

    # Init upload drop zone
    uploadMixDropzone = new Dropzone '.drag-and-drop',
      url: '/upload/path'
      clickable: true
      previewsContainer: document.querySelector('.preview-container')
      previewTemplate: document.querySelector('#preview-template').innerHTML


    # Init events
    uploadMixDropzone.on 'dragenter', () ->
      console.log 'dragenter'
      $( @element ).addClass('dragenter')

    uploadMixDropzone.on 'dragleave', () ->
      console.log 'dragleave'
      $( @element ).removeClass('dragenter')

    uploadMixDropzone.on 'addedfile', () =>
      console.log 'addedFile'
      
      @dom.find('.page1').hide()
      @dom.find('.page2').show()

    uploadMixDropzone.on 'removedfile', () =>
      console.log 'removedFile'

    # Prepare validation
    @prepareValidation()

    # Submit form
    @dom.find('#description').on 'submit', (e) =>
      e.preventDefault();
      titleValid = @validate( @title )
      tagsValid = @validate( @tags )

      if titleValid and tagsValid
        console.log 'submiting form'


  prepareValidation: () ->
    @title = @dom.find('input[name="title"]')
    @tags = @dom.find('input[name="tags"]')

    @title.on 'keyup', () =>
      @validate( @title )

    @tags.on 'keyup', () =>
      @validate( @tags )


  # Validate form kok
  validate: (elem) ->
    if elem.val() is ''
      elem.addClass('invalid')
      return false

    else
      elem.removeClass('invalid')
      return true
    
>>>>>>> Upload template page 2, simple validation.
