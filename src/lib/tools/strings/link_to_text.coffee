strip_tags = require './strip_tags'
replace_all = require './replace_all'

module.exports = (str) ->
  if typeof str is "string" and str.length > 0
    str = replace_all "<br /> ", "\n", str
    str = replace_all "<br> ", "\n", str
    str = replace_all "<br />", "\n", str
    str = replace_all "<br>", "\n", str

    return strip_tags( str )
  else
    return ""