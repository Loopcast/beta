moment = require 'moment'

module.exports = ( start_time ) ->
  now      = moment()
  started  = moment start_time
  s  = now.diff started, 'seconds'  

  return s

