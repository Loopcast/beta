module.exports = (str) ->
  return str.replace(/(<([^>]+)>)/ig,"");