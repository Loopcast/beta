replace_all = require './replace_all'
require '../../../frontend/vendors/autolink-min.js'

module.exports = (str) ->
  if typeof str is "string" and str.length > 0
    str = replace_all '<br />', '<br /> ', str
    return str.autoLink( target: "_blank", rel: "nofollow" )
  else
    return ""