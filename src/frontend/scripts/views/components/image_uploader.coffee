require 'happens'
Cloudinary = require 'app/controllers/cloudinary'

###
Unsigned upload to Cloudinary
http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud
###


module.exports = class ImageUploader 
	constructor: (dom) ->
		happens @
		
		# Get the config values from the hidden files
		api_key     = dom.find( '.api_key' ).val()
		cloud_name  = dom.find( '.cloud_name' ).val()
		unsigned_id = dom.find( '.unsigned_id' ).val()

		# Set the config on the controller
		Cloudinary.set_config
			cloud_name  : cloud_name
			api_key     : api_key
			unsigned_id : unsigned_id

		progress = dom.find '.progress'

		# Initialise the form with cloudinary
		Cloudinary.initialise_form dom.find( 'form' ), (form) ->
			# Listen to events
			form.on 'cloudinarydone', on_upload_complete
			form.on 'fileuploadstart', on_upload_start
			form.on 'fileuploadprogress', on_upload_progress
			form.on 'fileuploadfail', on_upload_fail


		ref = @
		on_upload_start = (e, data) ->
			log "[Cloudinary] on_upload_start", e, data

			progress.removeClass 'hide'

			ref.emit 'started', data

		
		on_upload_progress = (e, data) ->
			percent = data.loaded / data.total * 100
			log "[Cloudinary] on_upload_progress", percent + "%"

			progress.css "width", "#{percent}%"

			ref.emit 'progress', progress


		on_upload_complete = (e, data) -> 
			log "[ImageUploader] on_upload_complete", e, data
			
			progress.addClass 'hide'

			ref.emit 'completed', data


		on_upload_fail = (e, data) ->
			log "[Cloudinary] on_upload_fail", e

			ref.emit 'error', e



