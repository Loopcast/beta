happens = require 'happens'

module.exports = class Select

  constructor: ( @dom ) ->

    happens @
    @dom.addClass 'select_wrapper'

    handler = @dom.find '.handler .text'
    select  = @dom.find 'select'

    first_value = handler.html()
    
    ref = @

    select.on 'change', ->
      
      str = select.val()
      if str.length > 0
        handler.html select.val()
      else
        handler.html first_value

      ref.emit 'changed', select.val()