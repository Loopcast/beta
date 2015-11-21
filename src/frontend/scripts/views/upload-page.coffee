Dropzone = require 'dropzone'

module.exports = class UploadPage
  constructor: ( @dom ) ->

    console.log 'uplaod page inited'
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
        @dom.find('.page2').hide()
        @dom.find('.page3').show()



  prepareValidation: () ->
    @title = @dom.find('input[name="title"]')
    @tags = @dom.find('input[name="tags"]')

    @title.on 'keyup', () =>
      @validate( @title )

    @tags.on 'keyup', () =>
      @validate( @tags )


  # Validate form
  validate: (elem) ->
    if elem.val() is ''
      elem.addClass('invalid')
      return false

    else
      elem.removeClass('invalid')
      return true

