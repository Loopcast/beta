###

Compiles a stylus file and return a compiled css file

###

fs     = require 'fs'
path   = require 'path'
stylus = require 'stylus'

# stylus plugins
autoprefixer = require 'autoprefixer-stylus'
rupture      = require 'rupture'

module.exports = 

	method: 'GET'
	path  : '/css/{file}'

	handler: ( request, reply ) ->

		root = path.join( __dirname + '/../../views/styles/' )

		url  = root + request.params.file.replace '.css', '.styl'

		fs.readFile url, encoding: 'utf-8', ( error, content ) ->

			# If the stylus file doesn't exists
			# look for the real css file
			if error 
				root = path.join( __dirname + '/../../../www/css/' )
				
				url = root + request.params.file

				fs.readFile url, encoding: 'utf-8', ( error, content ) ->

					# If the real css file doesn't exists
					# return 404
					if error then return reply( "stylus file not found" ).code 404

					return reply( content ).type( 'text/css' ) 
			else
				style = stylus( content )
					.set( "filename", url )
					.set('linenos'  , on  )
					.use( autoprefixer()  )
					.use( rupture()       )
					.render ( error, css ) ->

						if error then return reply error

						reply( css ).type( 'text/css' )