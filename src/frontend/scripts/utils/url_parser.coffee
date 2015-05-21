UrlParser =
  is_file: ( url ) ->
    temp = url.split '.'
    return temp[ temp.length - 1 ].length < 4

  get_pathname: ( url ) ->
    find = location.origin
    re = new RegExp find, 'g'

    url.replace re, ''

  is_url: ( s ) ->
    regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s)

  is_internal_page: (url) ->
    if url.indexOf( 'http' ) is 0
      return false
    return true

  make_absolute: ( url ) ->
    if url.indexOf( 'http' ) isnt 0
      url = 'http://' + location.host + url
    return url


module.exports = UrlParser