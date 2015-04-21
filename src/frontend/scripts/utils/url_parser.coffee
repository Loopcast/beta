module.exports = 
  get_pathname: ( url ) ->
    find = location.origin
    re = new RegExp find, 'g'

    url.replace re, ''

  is_url: ( s ) ->
    regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s)

