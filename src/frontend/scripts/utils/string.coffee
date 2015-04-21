module.exports = 
  is_empty : ( str ) ->
    s = str.replace(/\s+/g, '')
    return s.length <= 0

  trim: ( str ) ->
    return str.replace(/(\r\n|\n|\r)/gm,"");