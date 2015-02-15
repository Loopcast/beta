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
	initialise_form: ( form, callback ) ->
		form.append( $.cloudinary.unsigned_upload_tag( @config.unsigned_id, 
			cloud_name: @config.cloud_name
		) )

		delay 100, -> callback form



# will always export the same instance
module.exports = new Cloudinary
