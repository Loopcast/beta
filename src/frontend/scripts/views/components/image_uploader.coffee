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
	

		progress = dom.find '.progress'

		ref = @


		###
		Disable drag and drop feature because of a cloudinary bug:
		when two input files are on the same page, when you drag an image on one input file, 
		both inputs will upload the same image at the same time.
		###
		kill = (e) -> 
			e.preventDefault()
			e.stopPropagation()


		dom.on
			dragover: kill
			drop: kill
			dragenter: kill
			dragleave: kill

			


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



		is_own_event = (e) ->
			return e.currentTarget



		# Initialise the form with cloudinary
		form = dom.find( 'form' )
		form.append( $.cloudinary.unsigned_upload_tag( unsigned_id, {
			cloud_name: cloud_name
		}, {
			cloudinary_field: unsigned_id
		}).on( 'cloudinarydone', on_upload_complete )
		 .on( 'fileuploadstart', on_upload_start )
		 .on( 'fileuploadprogress', on_upload_progress )
		 .on( 'fileuploadfail', on_upload_fail )
		)
			# Listen to events