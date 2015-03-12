module.exports = ( obj ) ->
  if obj.emit?
    obj.on          = null
    obj.once        = null
    obj.off         = null
    obj.emit        = null
    obj.__listeners = null
    obj.__init      = null