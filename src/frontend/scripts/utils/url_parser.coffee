module.exports = 
  get_pathname: ( url ) ->
    find = location.origin
    re = new RegExp find, 'g'

    url.replace re, ''