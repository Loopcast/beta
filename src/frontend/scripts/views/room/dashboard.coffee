start_recording = require 'app/utils/appcast/start_recording'
start_stream    = require 'app/utils/appcast/start_stream'
stop_recording  = require 'app/utils/appcast/stop_recording'
stop_stream     = require 'app/utils/appcast/stop_stream'

module.exports = (dom) ->

	init = ->
		view.once 'binded', on_ready

	on_ready = ->
		broadcast_trigger = view.get_by_dom dom.find( '.broadcast_controls' )
		recording_trigger = view.get_by_dom dom.find( '.recording_controls' )

		broadcast_trigger.on 'change', on_broadcast_click

	on_broadcast_click = (data) ->
		log "on_broadcast_click", data

		if data is "start"
			# do start_stream
		else
			# do stop_stream

	on_recording_click = (data) ->
		log "on_recording_click", data

		if data is "start"
			# do start_recording
		else
			# do stop_recording


	init()