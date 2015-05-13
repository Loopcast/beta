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

  DEFAULT_SELECTOR: '#content .inner_content'

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

    $('body').on 'click', 'a', (e) ->
      href = $(@).attr 'href' 
      if href is '#'
        return false



  url_changed: ( req, next ) =>
    req.url = req.path.replace "/#", '' 

    log "[Navigation] URL CHANGED", req, window.opener?

    if not url_parser.is_internal_page req.url
      log "NOT INTERNAL PAGE", req.url
      next()
      return

    if @first_time
      @first_time = false
      return

    if @silent
      @silent = off
      return  


    div = $ '<div>'

    delay 10, => 
      if @main_refresh()
        @emit 'before_load'

    div.load req.url, =>

      @emit 'on_load'
      @emit 'before_destroy'    

      if app.body.scrollTop() > 0
        app.body.animate scrollTop: 0

      delay 400, =>     

        new_content = div.find( @content_selector ).children()
        
        # log "[Navigation] loading", @content_selector
        @content_div = $ @content_selector

        # Remove old content
        @content_div.children().remove()

        # populate with the loaded content
        @content_div.append new_content
        delay 10, => @emit 'after_render'


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
    @silent = true
    page.replace url, null, null, false

  main_refresh: ->
    @DEFAULT_SELECTOR is @content_selector


# will always export the same instance
module.exports = new Navigation