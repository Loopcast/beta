module.exports = 
  is_empty : ( str ) ->
    return true if not str
  
    s = str.replace(/\s+/g, '')
    return s.length <= 0

  trim: ( str ) ->
    return str.replace(/(\r\n|\n|\r)/gm,"");

  line_breaks_to_br: ( str ) ->
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');

  cut_text: ( str, max ) ->
    if str.length > max - 3
      return str.substring( 0, max - 3 ) + "..."
    else
      return str