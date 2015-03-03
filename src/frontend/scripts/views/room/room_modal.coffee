Modal = require '../components/modal'


module.exports = class RoomModal extends Modal

	cover_uploaded: ""
	constructor: ( @dom ) ->
		super @dom

		@title = @dom.find '.roomname'

		
		
		@location = @dom.find '.location'
		@description = @dom.find '.description'
		@message = @dom.find '.message'

		@submit = @dom.find '.submit_button'

		view.once 'binded', @on_views_binded

	on_views_binded: ( ) =>

		room_image_uploader = view.get_by_dom @dom.find( '.room_image' )

		if not room_image_uploader
			log "[rooms/createModal] views not binded yet!!!"
			return


		@genre = view.get_by_dom @dom.find( '.genre' )


		room_image_uploader.on 'completed', @_on_cover_changed
		@title.on 'keyup'                 , @_on_title_changed
		@location.on 'keyup'              , @_on_location_changed
		@description.on 'keyup'           , @_on_description_changed
		@genre.on 'change'                , @_on_genre_changed
		@submit.on 'click'                , @_submit


		log "genre", @genre
		

	_on_cover_changed: (data) =>
		@cover_uploaded = data.result

		console.log "got image result ->", data.result

		@emit 'input:changed', { name: 'cover', value: data.result }

	_on_title_changed: ( ) =>
		@_check_length @title
		@emit 'input:changed', { name: 'title', value: @title.val() }

	_on_genre_changed: ( data ) =>
		log "_on_genre_changed", data
		@emit 'input:changed', { name: 'genre', value: data.join( ', ' ) }

	_on_location_changed: ( ) =>
		@emit 'input:changed', { name: 'location', value: @location.val() }

	_on_description_changed: ( ) =>
		@emit 'input:changed', { name: 'description', value: @description.val() }

	_check_length: ( el ) ->
		if el.val().length > 0
			el.removeClass 'required'
		else
			el.addClass 'required'

	_submit: ( ) =>
		log "submit"

		# quick validation sketch
		if not @title.val()
			@title.addClass( 'required' ).focus()
			return 

		data = 
			title    : @title.val()
			genres   : @genre.get_tags( true )
			location : @location.val()
			about    : @description.val()
			cover    : @cover_uploaded

		@emit 'submit', data


	show_message: ( msg ) ->
		@message.html( msg ).show()

	hide_message: ( ) ->
		@message.hide()

	open_with_data: ( data ) ->
		log "[RoomModal] open_with_data", data

		@dom.addClass 'edit_modal'
		@title.val data.title
		@genre.add_tags data.genres
		@location.val data.location
		@description.val data.about

		@open()

		return false




		



