module.exports = (url, new_name) ->
  temp = url.split '/'
  temp[1] = new_name
  return temp.join('/')
