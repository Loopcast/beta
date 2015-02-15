require 'happens'

class Cloudinary
	instance = null
	config: 
		cloud_name: ""
		api_key: ""


	constructor: ->
		if Cloudinary.instance
			console.error "You can't instantiate this Cloudinary twice"	
			return

		Cloudinary.instance = @

	set_config: ( data ) ->

		if @config.cloud_name isnt data.cloud_name or @config.api_key isnt data.api_key
			# Update the internal object
			@config = data

			# Update the jQuery plugin config
			$.cloudinary.config
				cloud_name: @config.cloud_name 
				api_key   : @config.api_key

	# Return the form with the cloudinary unsigned input file appended
	initialise_form: ( form, unsigned_id, callback ) ->

		form.append( $.cloudinary.unsigned_upload_tag( unsigned_id, 
			cloud_name: @config.cloud_name
			public_id: unsigned_id
			tags: unsigned_id
		) )

		delay 100, -> callback form



# will always export the same instance
module.exports = new Cloudinary
