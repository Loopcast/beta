# appcast = require 'app/utils/appcast'

module.exports = (dom) ->

	volume = 
		left : null
		right: null


	init = ->
		view.once 'binded', on_ready

	on_ready = ->
		broadcast_trigger = view.get_by_dom dom.find( '.broadcast_controls' )
		recording_trigger = view.get_by_dom dom.find( '.recording_controls' )

		if broadcast_trigger.length > 0 
			broadcast_trigger.on 'change', on_broadcast_click

		volume.left = view.get_by_dom dom.find( '.meter_wrapper.left' )
		volume.right = view.get_by_dom dom.find( '.meter_wrapper.right' )

		# Example of how to use the volume object
		volume.left.set_volume 0.7
		volume.right.set_volume 0.78

		input_select = view.get_by_dom dom.find( '.input_select' )
		input_select.on 'changed', (data) ->
			log "[Dashboard] input changed", data




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