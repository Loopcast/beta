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

		# if data is different from the current config, update it
		if @config.cloud_name isnt data.cloud_name or @config.api_key isnt data.api_key
			# Update the internal object
			@config = data

			# Update the jQuery plugin config
			$.cloudinary.config
				cloud_name: @config.cloud_name 
				api_key   : @config.api_key


# will always export the same instance
module.exports = new Cloudinary
