WatchJS = require 'watchjs'
watch = WatchJS.watch

module.exports = class GUI
  opened: false
  use_keys: false
  use_click: true
  toggle_key: 68

  constructor: ->
    html = require 'templates/debug/gui'

    $( 'body' ).append html()

    @dom = $( '#gui' )
    @content = @dom.find '.content'

    if @use_click
      @dom.addClass( 'clickable' ).on 'click', @toggle

    if @use_keys
      $(window).on 'keyup', @on_key_pressed

  on_key_pressed: ( e ) =>
    if e.keyCode is @toggle_key
      @toggle()

  toggle: =>
    if @opened
      @close()
    else
      @open()

  close : ->
    return if not @opened
    @opened = false
    @dom.addClass 'closed'

  open: ->
    return if @opened
    @opened = true
    @dom.removeClass 'closed'

  watch: ( obj ) ->

    @obj = jQuery.extend(true, {}, obj);
    # @print obj
    watch @obj, @refresh

    @refresh()

  refresh: =>
    html = @print( JSON.stringify(@obj, undefined, 4) )
    @content.html html

  print : ( obj ) ->
    json = obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    json.replace /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) ->
      cls = 'number'
      if /^"/.test(match)
        if /:$/.test(match)
          cls = 'key'
        else
          cls = 'string'
      else if /true|false/.test(match)
        cls = 'boolean'
      else if /null/.test(match)
        cls = 'null'
      '<span class="' + cls + '">' + match + '</span>'

    
