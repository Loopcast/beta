LoggedView      = require 'app/views/logged_view'
Dropzone        = require 'dropzone'
Cloudinary      = require 'app/controllers/cloudinary'
transform       = require 'lib/cloudinary/transform'


module.exports = class UploadPage
  constructor: ( @dom ) ->

    view.on 'binded', @on_views_binded


    # Init properties
    @form = @dom.find('#description')


    # Init upload drop zone
    @initDropzone()

    # Prepare validation
    @prepareValidation()


    # Submit form
    @form.on 'submit', (e) =>
      e.preventDefault();
      titleValid = @validate( @title )
      tagsValid = @validate( @tags )

      if titleValid and tagsValid
        @dom.find('.page2').hide()
        @dom.find('.page3').show()


    # Return to upload page btn
    @dom.find('#return-to-upload').click (e) =>
      @form[0].reset()
      @dom.find('.page1').show()
      @dom.find('.page2').hide()
      @dom.find('.page3').hide()

  

  initDropzone: () ->
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


  # Handle mix cover upload
  onCoverUploaded: (data) =>
    log "[Cover uploader]", data.result.url

    cover = transform.upload_mix_cover data.result.url

    @dom.find( '.mix-cover' ).css
      'background-image': "url(#{cover})"

    @saveData cover_url: data.result.url


  on_views_binded: ( scope ) =>
    return if not scope.main

    # Init cover uploader
    view.off 'binded', @on_views_binded
    @coverUploader = view.get_by_dom @dom.find( '.mix-cover' )
    @coverUploader.on 'completed', @onCoverUploaded


  # Save data to backend
  saveData: () ->
    # Save data here
