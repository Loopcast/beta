settings    = require 'app/utils/settings'
happens   = require 'happens'
# ways      = require 'ways'
# ways.use require 'ways-browser'
url_parser = require 'app/utils/url_parser'
page = require 'page'

class Navigation

  instance = null
  silent: false
  first_time: true
  custom_class: ""
  DEFAULT_SELECTOR: '#content .inner_content'
  lock_live: false
  locked_live_url : ""
  prev_url: ""
  mobile_style: true

  constructor: ->

    if Navigation.instance
      console.error "You can't instantiate this Navigation twice" 

      return

    Navigation.instance = @
    happens @

    @content_selector = @DEFAULT_SELECTOR
    @content_div = $ @content_selector

    # routing
    page '*', @url_changed
    page()

    ref = @
    $('body').on 'click', 'a', (e) ->
      el = $ @
      href = el.attr 'href' 
      # log "href", href
      if href is '#'
        e.preventDefault()
      else if el.data( 'nav-load' ) and app.settings.theme is 'desktop'
        ref.content_selector = el.data( 'nav-load' )
        ref.custom_class = 'loading_on_top ' + el.data( 'nav-custom-class' )


  set_lock_live: ( lock, url ) ->
    # log "[Navigation] set_lock_live", lock
    @lock_live = lock
    @locked_live_url = url

  url_changed: ( req, next ) =>

    req.url = req.path.replace "/#", '' 

    # log "[Navigation] URL CHANGED", req, @custom_class, @lock_live

    if not url_parser.is_internal_page req.url
      # log "NOT INTERNAL PAGE", req.url
      next()
      return

    # return if is a download link
    if req.url.indexOf( '/download'  ) is 0 then return next()

    if @first_time
      @first_time = false
      # log "[Navigation] FIRST TIME, returning"
      @prev_url = req.url
      return

    if @silent
      # log "[Navigation] SILENT, returning"
      @silent = off
      return

    if @prev_url is req.url 
      return


    if @lock_live
      app.emit 'exit_modal:request_open'

      app.on 'exit_modal:answered', (answer) =>
        # log "[Navigation] exit_modal:answered", answer

        app.off 'exit_modal:answered'
        if not answer
          # log "[Navigation] go silent", @locked_live_url
          @go_silent @locked_live_url
          next()
        else
          @load_url req
        
    else
      @load_url req

    @prev_url = req.url 

  load_url: ( req ) ->

    @emit 'dropdown:request_close'
    
    div = $ '<div>'

    if @custom_class.length > 0
      app.body.addClass @custom_class
      delay 1, => app.body.addClass 'loading_visible'

    delay 10, => @emit 'before_load'

    div.load req.url, =>

      document.title = div.find( 'title' ).html()
      
      @prev_url = req.url
      @emit 'on_load'
      @emit 'before_destroy'    

      if app.body.scrollTop() > 0
        app.body.animate scrollTop: 0

      delay 200, =>     

        new_content = div.find( @content_selector ).children()
        
        if app.settings.theme is 'mobile'
          @mobile_append new_content, @on_content_ready
        else
          @normal_append new_content, @on_content_ready
        

  on_content_ready: =>
    @emit 'after_render'
    delay 200, => 
      @content_selector = @DEFAULT_SELECTOR
      app.body.removeClass 'loading_visible'
      
      delay 300, => 
        app.body.removeClass @custom_class
        @custom_class = ""
    
  mobile_append: (new_content, callback) ->
    new_content.addClass 'moving'
    @content_div = $ @content_selector   

    # app.emit 'loading:hide'
    ref = @
    # populate with the loaded content
    @content_div.append new_content

    delay 100, callback
    delay 400, ->

      new_content.addClass 'moved'

      delay 400, ->

        $($( '.dynamic_wrapper' )[ 0 ] ).remove()
        new_content.removeClass 'moving moved'
        ref.emit 'content:ready'


  normal_append: (new_content, callback) ->
    @content_div = $ @content_selector

    # Remove old content
    @content_div.children().remove()

    # populate with the loaded content
    @content_div.append new_content

    @emit 'content:ready'

    callback()




  ##
  # Navigates to a given URL using Html 5 history API
  ##
  go: ( url ) ->

    # If it's a popup, bypass ways and seamless navigation
    if window.opener?
      location.href = url
      return true

    page url
    # ways.go url

    return false

  go_silent: ( url, title ) ->
    # log "[Navigation] go_silent method", url
    # @silent = true
    page.replace url, null, null, false

  main_refresh: ->
    @DEFAULT_SELECTOR is @content_selector


# will always export the same instance
module.exports = new Navigation