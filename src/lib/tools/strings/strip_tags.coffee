module.exports = (str) ->
  if typeof str is "string" and str.length > 0
    return str.replace(/(<([^>]+)>)/ig,"");
  else
    return ""