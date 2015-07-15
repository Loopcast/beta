Url = require 'app/utils/url_parser'
transform = require 'lib/cloudinary/transform'
module.exports = class Share

  opened    : false
  handler   : null
  black_box : null
  input     : null
  copy_btn  : null

  constructor: (@dom) ->
    ref = @

    @normal_type = not @dom.data( 'type' )?

    if @normal_type
      html = require 'templates/buttons/share'

      @dom.append html()


    @handler   = @dom.find '.ss-action'
    @black_box = @dom.find '.share_box' 
    @input     = @dom.find 'input'
    @copy_btn  = @dom.find '.button'
    @facebook_link = @dom.find '.share_popup_facebook, .share_fb'
    @twitter_link = @dom.find '.share_popup_twitter, .share_twitter'
    @google_link = @dom.find '.share_popup_google, .share_google'

    @handler.on 'click', @toggle
    @dom.on 'click',  (e) -> e.stopPropagation()
    @input.on 'click', @select
    @copy_btn.on 'click', @on_copy_clicked
    app.on 'share:opened', @on_share_opened
    app.window.on 'body:clicked', @close
    app.window.on 'scroll', @close

    @facebook_link.on 'click', @share_on_facebook
    @twitter_link.on 'click', @share_on_twitter
    @google_link.on 'click', @share_on_google

    if @dom.data( 'permalink' )?
      @update_with_data
        link: Url.make_absolute( @dom.data 'permalink' )
        title: @dom.data 'title'
        summary: @dom.data 'summary'
        image: @dom.data 'image'

  update_with_data: ( data ) ->
    @data = data
    @data.link = Url.make_absolute( @data.link )
    @data.image = Url.make_absolute( transform.explore_thumb @data.image )

    @update_link @data.link

  on_share_opened: ( uid ) =>
    if uid isnt @uid
      @close()

  on_copy_clicked: =>
    @input[ 0 ].select()
    if app.settings.browser.OS is "Mac"
      text = "Press CMD + C to copy the link"
    else
      text = "Press Ctrl + C to copy the link"
    alert text
    return false


  toggle : (e) =>
    if @opened 
      @close()
    else
      @open()

    e.preventDefault()

  close : =>
    return if not @opened
    @opened = false
    @dom.removeClass 'opened'

  open : =>
    return if @opened
    @opened = true
    app.emit 'share:opened', @uid

    # Check the position of the handler



    top = @handler.offset().top
    y = app.window.y
    h = @black_box.height()
    diff = top - y
    # log 'position', diff, h+100


    

    if diff < h + 100
      @dom.addClass 'on_bottom'
    else
      @dom.removeClass 'on_bottom'

    @dom.addClass 'opened'

    delay 1, =>

      o = @black_box.offset()
      w1  = @black_box.width()

      if o.left + w1 > app.window.w - 20
        @dom.addClass 'on_right'

      else if o.left < 0

        @dom.addClass 'on_left'
        @black_box.css 
          'margin-left' : o.left

      

  update_link: ( link ) ->
    @input.val link


  destroy: ->
    @handler.off 'click', @toggle
    @dom.off 'click'
    @input.off 'click', @select
    @copy_btn.off 'click', @on_copy_clicked
    app.off 'share:opened', @on_share_opened
    app.window.off 'body:clicked', @close
    app.window.off 'scroll', @close

    @facebook_link.off 'click', @share_on_facebook
    @twitter_link.off 'click', @share_on_twitter
    @google_link.off 'click', @share_on_google

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
  

  

