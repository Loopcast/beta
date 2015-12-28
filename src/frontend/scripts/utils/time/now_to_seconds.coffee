moment = require 'moment'

module.exports = ( start_time ) ->
  now      = moment().utc()
  started  = moment start_time

  s = now.diff started, 'seconds'  
  s = Math.max( 0, s )

  return s

