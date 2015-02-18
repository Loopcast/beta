Modal   = require './../components/modal'

module.exports = class CreateRoomModal extends Modal

	constructor: ( @dom ) ->
		super @dom

		@title = @dom.find '.roomname'
		@genre = @dom.find '.genre'
		@location = @dom.find '.location'
		@description = @dom.find '.description'

		@title.on 'keyup', @_on_title_changed
		@genre.on 'keyup', @_on_genre_changed
		@location.on 'keyup', @_on_location_changed
		@description.on 'keyup', @_on_description_changed

	_on_title_changed: ( ) =>
		@emit 'input:changed', { name: 'title', value: @title.val() }

	_on_genre_changed: ( ) =>
		@emit 'input:changed', { name: 'genre', value: @genre.val() }

	_on_location_changed: ( ) =>
		@emit 'input:changed', { name: 'location', value: @location.val() }

	_on_description_changed: ( ) =>
		@emit 'input:changed', { name: 'description', value: @description.val() }



		



	