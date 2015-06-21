happens = require 'happens'
happens_destroy = require 'app/utils/happens_destroy'

class View

	UNIQUE_ID  	= 0


	###
	Hash Map to store the views:

	hash_model = {
		"<view_name>" : [ <view_instance>, <view_instance>, .. ],
		"<view_name>" : [ <view_instance>, <view_instance>, .. ]
	}
	###
	hash_model  : {}


	###
	Uid Map. Internal map used for easily get a view by uid

	uid_map = {
		"<UNIQUE_ID>" : { name : <view_name>, index: <view_index> },
		"<UNIQUE_ID>" : { name : <view_name>, index: <view_index> },
		  ...
	}
	###
	uid_map: {}





	# Get the view from the hash model
	get: ( id, index = 0 ) =>
		unless @hash_model[ id ]?
			# console.error "View #{id} #{index} doesn't exists"
			return false

		@hash_model[ id ][ index ]



	get_by_uid: ( uid ) =>
		if @uid_map[ uid ]?
			name = @uid_map[ uid ].name
			index = @uid_map[ uid ].index

			return @get name, index

		return false

	get_by_dom: ( selector ) => @get_by_uid $( selector ).data 'uid'



	bind: ( scope = 'body', tolog = false ) ->
		# console.error "[views] Bindings views: #{scope}"
		$( scope ).find( '[data-view]' ).each( ( index, item ) =>

			$item = $ item

			view_name = $item.data( 'view' )

			# log "[views] binding", view_name

			$item.removeAttr 'data-view'

			if view_name.substring(0, 1) is "["
				names = view_name.substring(1, view_name.length - 1).split(",")
			else
				names = [view_name]

			for name in names
				@_add_view $item, name

			# remove the data-view attribute, so it won't be instantiated twice!
			$item.removeAttr 'data-view'

		).promise().done => 
			data = 
				scope: scope
				main: scope in [ 'body', '#content' ]

			@emit "binded", data
			# app.on_views_binded data

	unbind: ( scope = 'body' ) ->
		log "[VIEW] unbind", scope
		$( scope ).find( '[data-uid]' ).each( ( index, item ) =>

			$item = $ item

			id = $item.data 'uid'

			v = view.get_by_uid id

			if v
				@destroy_view v

		).promise().done => 
			data = 
				scope: scope
				main: scope in [ 'body', '#content' ]

			@emit "unbinded", data

	destroy_view: ( v ) ->
		happens_destroy v
		v.destroy?()
		v.view_name = null
		view.on_view_destroyed v.uid

	_add_view: ( $item, view_name ) ->

		try
			view = require "app/views/#{view_name}"
		catch e
			console.warn 'e ->', e.message, view_name
			console.error "app/views/#{view} not found for ", $item

		view = new view $item

		# Save the view in a hash model
		@hash_model[ view_name ] ?= []

		l = @hash_model[ view_name ].length

		@hash_model[ view_name ][ l ] = view


		# Save the incremental uid to the dom and to the instance
		view.uid = UNIQUE_ID
		view.view_name = view_name

		# log "[view] add", view.uid, view.view_name

		$item.attr 'data-uid', UNIQUE_ID

		# Save the view in a linear array model
		@uid_map[ UNIQUE_ID ] =
			name  : view_name
			index : @hash_model[ view_name ].length - 1


		UNIQUE_ID++




	on_view_destroyed: ( uid ) ->
		
		# log "[View] on_view_destroyed", uid
		if @uid_map[ uid ]?

			# Get the data from the uid map
			name  = @uid_map[ uid ].name
			index = @uid_map[ uid ].index

			# delete the reference in the model
			if @hash_model[ name ][ index ]?

				# delete the item from the uid_map
				delete @uid_map[ uid ]

				# Delete the item from the hash_model
				@hash_model[ name ].splice index, 1

				# Update the index on the uid_map for the views left of the same type
				for item, i in @hash_model[ name ]
					@uid_map[ item.uid ].index = i


				



view = new View
happens view

module.exports = window.view = view