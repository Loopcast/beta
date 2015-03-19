module.exports = (images, callback) ->

	count = 0
	images_loaded = []

	load = ( src, callback ) ->
			
		img = new Image()
		img.onload = callback
		img.src = src

		images_loaded.push img

	loaded = ->
		count++
		# log "[Preloader] load_multiple - loaded", "#{count} / #{images.length}"

		if count is images.length
			# log "[Preloader] load_multiple - loaded ALL"
			callback( images_loaded )

	for item in images
		load item, loaded
