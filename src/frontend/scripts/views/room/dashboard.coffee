module.exports = (dom) ->

	init = ->
		view.once 'binded', on_ready

	on_ready = ->
		broadcast_trigger = view.get_by_dom dom.find( '.broadcast_controls' )
		recording_trigger = view.get_by_dom dom.find( '.recording_controls' )

		log "broadcast_trigger", broadcast_trigger
		log "recording_trigger", recording_trigger

		broadcast_trigger.on 'change', on_broadcast_change

	on_broadcast_change = (data) ->
		log "on_broadcast_change", data

	on_recording_change = (data) ->
		log "on_recording_change", data


	init()