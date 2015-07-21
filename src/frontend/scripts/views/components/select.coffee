happens = require 'happens'

module.exports = class Select
  handler: null
  select: null
  first_value: null
  constructor: ( @dom ) ->

    happens @
    @dom.addClass 'select_wrapper'

    @handler = @dom.find '.handler .text'
    @select  = @dom.find 'select'

    @first_value = @handler.html()
    
    ref = @

    @select.on 'change', @set_value
      
      
  _set_value: ( val ) ->
    @select.val val
    @set_value()

    
  set_value: => 
    str = @select.val()
    if str.length > 0
      @handler.html @select.val()
    else
      @handler.html @first_value

    @emit 'changed', @select.val()