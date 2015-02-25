appcast = require 'app/controllers/appcast'

module.exports =

  start_recording : ->
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

  stop_recording : ->
    if not appcast.get 'stream:recording'

      console.error '- cant stop recording if not recording'
      return

    console.log '+ stopping to record with ', appcast.get 'input_device'
    
    # post to backend in order to start recording set

    url  = "/tape/stop/recording"
    done = ->
      console.info '+ /tape/stop/recording post done ->', arguments

    fail = ->
      console.error '- /tape/stop/recording post failed ->', arguments

    # post to backend in order to start recording
    $.post( url ).done( done ).fail( fail )



  start_stream : ->
    if not appcast.get 'input_device'

      console.error '- cant start stream before selecting input device'
      return

    console.log 'starting streaming with', appcast.get 'input_device'
    
    appcast.start_stream appcast.get 'input_device'



  stop_stream : -> 
    if not appcast.get 'streaming:online'

      console.error '- cant stop stream if not streaming'
      return

    console.log '+ stoping streaming with', appcast.get 'input_device'
    
    appcast.stop_stream()