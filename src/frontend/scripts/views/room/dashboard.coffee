# appcast = require 'app/utils/appcast'

module.exports = (dom) ->

	init = ->
		view.once 'binded', on_ready

	on_ready = ->
		broadcast_trigger = view.get_by_dom dom.find( '.broadcast_controls' )
		recording_trigger = view.get_by_dom dom.find( '.recording_controls' )

		if broadcast_trigger.length > 0 
			broadcast_trigger.on 'change', on_broadcast_click

	on_broadcast_click = (data) ->
		log "on_broadcast_click", data

		if data is "start"
			# do appcast.start_stream
		else
			# do appcast.stop_stream

	on_recording_click = (data) ->
		log "on_recording_click", data

		if data is "start"
			# do appcast.start_recording
		else
			# do appcast.stop_recording


	init()