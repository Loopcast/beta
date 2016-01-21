module.exports = ->
  url = window.location.href
  arr = url.split "/"

  return arr[0] + "//" + arr[2]
