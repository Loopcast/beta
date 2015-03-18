module.exports = 
  is_empty : ( str ) ->
    s = str.replace(/\s+/g, '')
    return s.length <= 0