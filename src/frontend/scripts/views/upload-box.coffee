LoggedView      = require 'app/views/logged_view'
Dropzone        = require 'dropzone'
Cloudinary      = require 'app/controllers/cloudinary'
transform       = require 'lib/cloudinary/transform'
Happens         = require 'happens'


module.exports = class UploadBox
  constructor: ( @dom ) ->

    Happens @

    @container = @dom.find('.container')

    view.once 'binded', @on_views_binded


    # Init upload drop zone
    @initDropzone()


    # Submit form
    @dom.find('.publish').on 'click', (e) =>
      e.preventDefault();
      titleValid = @validate( @title )
      tagsValid = @validateTags()

      if titleValid and tagsValid
        @showPage(3)


    # Return to upload page btn
    @dom.find('#return-to-upload').click (e) =>
      @showPage(1)


    # Prepare social share
    @prepareSocialShare()
  

  initDropzone: () ->
    dropzone = new Dropzone @dom.find('.drag-and-drop')[0],
      url: '/upload/path'
      clickable: true
      previewsContainer: document.querySelector('.preview-container')
      previewTemplate: document.querySelector('#preview-template').innerHTML


    # Init events
    dropzone.on 'dragenter', () =>
      @dom.addClass('drag')

    dropzone.on 'dragleave', () =>
      @dom.removeClass('drag')

    dropzone.on 'addedfile', () =>
      @emit 'addedFile'
      @dom.removeClass('drag')
      @showPage(2)

    # dropzone.on 'removedfile', () =>
    #   console.log 'removedFile'



  # Validate form
  validate: (elem) ->
    if elem.val() is ''
      elem.addClass('invalid')
      return false

    else
      elem.removeClass('invalid')
      return true

  # Validate tags input
  validateTags: (tags) =>
    if tags is undefined
      tags = @editableTags.get_tags()

    if @tagsInput is undefined
      @tagsInput = @dom.find('.tagsinput')

    if tags.length is 0 or tags[0] is ''
      @tagsInput.addClass('invalid')
      return false
    
    else
      @tagsInput.removeClass('invalid')
      return true


  # Handle mix cover upload
  onCoverUploaded: (data) =>
    log "[Cover uploader]", data.result.url

    cover = transform.upload_mix_cover data.result.url

    # Preload that image, then apply as bg
    img = new Image()
    img.src = cover
    img.onload = () =>
      @dom.find( '.mix-cover' ).css
        'background-image': "url(#{cover})"

    @saveData cover_url: data.result.url


  on_views_binded: ( scope ) =>
    return if not scope.main

    # Init cover uploader
    view.off 'binded', @on_views_binded
    @coverUploader = view.get_by_dom @dom.find( '.mix-cover' )
    @coverUploader.on 'completed', @onCoverUploaded

    # Prepare validation
    @editableTags = view.get_by_dom @dom.find( '.tags_wrapper' )
    
    @editableTags.on 'change', @validateTags

    @title = @dom.find('input[name="title"]')

    @title.on 'keyup', () =>
      @validate( @title )


  # Save data to backend
  saveData: () ->
    # Save data here


  # Prepare social share
  prepareSocialShare: () ->

    # Temporary share data
    @data = 
      title: 'Temporary title'
      link: 'Temporary link'
      summary: 'Temporary summary'


    @dom.find('.social .twitter').click @share_on_twitter
    @dom.find('.social .fb').click @share_on_facebook
    @dom.find('.social .googleplus').click @share_on_google
    
  share_on_facebook: =>

    FB.ui
      method: 'feed',
      link: @data.link,
      caption: @data.title,
      description: @data.summary,
      picture: @data.image
    , (response) ->
      log response

    return false
    # str = 'http://www.facebook.com/sharer.php?'+ 'u='+encodeURIComponent(@data.link)+ '&amp;t='+encodeURIComponent(@data.title)
    # @open_popup 'http://www.facebook.com/sharer.php?s=100&amp;p[title]=' + @data.title + '&amp;p[summary]=' + @data.summary + '&amp;p[url]=' + @data.link + '&amp;p[images][0]=' + @data.image
    # @open_popup str

  share_on_twitter: =>
    @open_popup 'http://twitter.com/share?text=' + @data.title + '&amp;url=' + @data.link + '&amp;hashtags=loopcast'
    return false

  share_on_google: =>
    @open_popup "https://plus.google.com/share?url=#{@data.link}"
    return false

  open_popup: ( url ) ->
    w = 548
    h = 325
    left = (screen.width/2)-(w/2)
    top = (screen.height/2)-(h/2)
    window.open url, 'sharer', 'toolbar=0,status=0,width='+w+',height='+h+',top='+top+',left='+left
    return false


  showPage: (number) ->
    @container.removeClass('page1-active page2-active page3-active')
              .addClass('page' + number + '-active')
