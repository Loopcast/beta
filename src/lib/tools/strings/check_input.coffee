module.exports = (str) ->
  if str.constructor is Array and (str.length <= 0 or str[0].length <= 0)
    return ""
  return str