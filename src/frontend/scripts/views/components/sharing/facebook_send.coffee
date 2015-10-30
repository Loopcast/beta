module.exports = (dom) ->
  # 'Send your room link to friends'
  url = if dom.data( 'link' )? then dom.data( 'link' ) else location.href

  dom.on 'click', ->
    FB.ui
      method: 'send',
      name: dom.data 'text'
      link: url
  
  if window.fb_ready
    fb_parse()
  else
    $(window).on 'fb:ready', fb_parse