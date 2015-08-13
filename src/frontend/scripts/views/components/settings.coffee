navigation      = require 'app/controllers/navigation'

module.exports = (dom) ->
  dom.find( 'a' ).on 'click', (e) ->
    e.stopPropagation()

    el = $ @
    url = el.attr 'href'
    target = el.attr 'target'

    if not target?
      navigation.go url
      return false

    return true