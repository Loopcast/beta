Modal = require '../components/modal'
L     = require 'api/loopcast/loopcast'

module.exports = class CreateRoomModal extends Modal

	cover_uploaded: ""
	constructor: ( @dom ) ->
		super @dom

		@title = @dom.find '.roomname'
		@genre = @dom.find '.genre'
		@location = @dom.find '.location'
		@description = @dom.find '.description'

		@submit = @dom.find '.submit_button'

		@title.on 'keyup'      , @_on_title_changed
		@genre.on 'keyup'      , @_on_genre_changed
		@location.on 'keyup'   , @_on_location_changed
		@description.on 'keyup', @_on_description_changed

		@submit.on 'click', @_submit

		view.once 'binded', @on_views_binded

	on_views_binded: ( ) =>

		room_image_uploader = view.get_by_dom @dom.find( '.room_image' )

		if not room_image_uploader
			log "[rooms/createModal] views not binded yet!!!"
			return

		room_image_uploader.on 'completed', @_on_cover_changed

		

	_on_cover_changed: (data) =>
		@cover_uploaded = data.result

		console.log "got image result ->", data.result

		@emit 'input:changed', { name: 'cover', value: data.result }

	_on_title_changed: ( ) =>
		@emit 'input:changed', { name: 'title', value: @title.val() }

	_on_genre_changed: ( ) =>
		@emit 'input:changed', { name: 'genre', value: @genre.val() }

	_on_location_changed: ( ) =>
		@emit 'input:changed', { name: 'location', value: @location.val() }

	_on_description_changed: ( ) =>
		@emit 'input:changed', { name: 'description', value: @description.val() }


	_submit: ( ) =>

		# quick validation sketch
		if not @title.val() then return @title.addClass 'required'

		data = 
			title    : @title.val()
			genres   : @genre.val()
			location : @location.val()
			about    : @description.val()
			cover    : @cover_uploaded

		log "[Create Room Modal] submit", data

		modal = @

		L.rooms.create data, ( error, room ) ->

			if error

				if error is "cant_have_two_live_rooms_with_same_url"
					console.error "Cant have two live rooms with same url"

				return console.error error
				
			console.info " ! Got room info!"
			console.warn room
			console.info " We should swap url HERE!"

			modal.close()



		



