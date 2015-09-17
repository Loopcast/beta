module.exports = (find, replace, str) ->
  if typeof str is "string" and str.length > 0
    return str.replace(new RegExp(find, 'g'), replace)
  else
    return str