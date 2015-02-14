require 'happens'

Cloudinary = happens {}

###
Unsigned upload to Cloudinary
http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud
###

Cloudinary.init = (form) ->
	api_key     = form.find( '.api_key' ).val()
	cloud_name  = form.find( '.cloud_name' ).val()
	unsigned_id = form.find( '.unsigned_id' ).val()

	$.cloudinary.config
		cloud_name: cloud_name 
		api_key   : api_key

	log "[Cloudinary] init"

	form.append( $.cloudinary.unsigned_upload_tag( unsigned_id, 
		cloud_name: cloud_name
	) ).bind 'cloudinarydone', (e, data) ->
		log "done", e, data
		Cloudinary.emit 'uploaded', data


module.exports = Cloudinary
