module.exports = (dom) ->
  dom.find( 'a' ).on 'click', (e) ->
    e.stopPropagation()
    return true