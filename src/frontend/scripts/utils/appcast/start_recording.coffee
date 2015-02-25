appcast = require 'app/controllers/appcast'

module.exports = ->
  if not appcast.get 'streaming:online'

    console.error '- cant start recording if not streaming'
    return

  console.log '+ start recording', appcast.get 'input_device'
  
  # post to backend in order to start recording set

  url  = "/tape/start/recording"
  done = ->
    console.info '+ recording post done ->', arguments
    appcast.set 'recording', true

  fail = ->
    console.error '- failing trying to start recording ->', arguments

  # post to backend in order to start recording
  $.post( url ).done( done ).fail( fail )
