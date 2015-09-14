replace_all = require './replace_all'
require '../../../frontend/vendors/autolink-min.js'

module.exports = (str) ->
  str = replace_all '<br />', '<br /> ', str
  return str.autoLink( target: "_blank", rel: "nofollow" )