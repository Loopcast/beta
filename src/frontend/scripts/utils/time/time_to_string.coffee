moment = require 'moment'

module.exports = (time) ->
  now      = moment()

  started  = moment time
  s  = now.diff started, 'seconds'

  sec_num = parseInt s, 10
  hours   = Math.floor sec_num / 3600
  minutes = Math.floor((sec_num - (hours * 3600)) / 60)
  seconds = sec_num - (hours * 3600) - (minutes * 60)

  if hours < 10
    hours = "0#{hours}"
  if minutes < 10
    minutes = "0#{minutes}"
  if seconds < 10
    seconds = "0#{seconds}"

  return {
    str: "#{hours}:#{minutes}:#{seconds}"
    seconds: sec_num
  }