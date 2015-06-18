happens = require 'happens'

module.exports = class Select

  constructor: ( @dom ) ->

    happens @
    @dom.addClass 'select_wrapper'

    handler = @dom.find '.handler .text'
    select  = @dom.find 'select'
    
    ref = @

    select.on 'change', ->
      
      handler.html select.val()

      ref.emit 'changed', select.val()