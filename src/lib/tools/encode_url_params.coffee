# convers objects proprty\value pairs to string representing uri parameters

module.exports = ( url_params ) ->
  params_array = []
  for prop, value of url_params 
    params_array.push "#{encodeURIComponent(prop)}=#{encodeURIComponent(value)}"
  
  return params_array.join('&')