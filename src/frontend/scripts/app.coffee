# utils / helpers
window.delay  		= require './utils/delay'
window.log  		= require './utils/log'
Window 				= require './utils/window'
require '../../vendors/modernizr.custom.js'

# events

happens         	= require 'happens'

# controllers
views         		= require './controllers/views'
# navigation        	= require './controllers/navigation'
# motion        		= require 'app/controllers/motion'

class App

	win:
		obj: null
		w: 0
		h: 0


	constructor: -> 	

		happens @

		@on 'ready', @after_render

	start: ->

		console.log "start"
		@body   = $ 'body'
		
		@settings = require 'app/utils/settings'
		@settings.bind @body

		# Resize management
		@window = new Window


		# Controllers binding
		do views.bind
		# do navigation.bind

		delay 10, =>
			@emit "views:binded"
		



	###
	# After the views have been rendered
	###
	after_render: ( ) =>
		# Hide the loading
		delay 10, => 
			@body.addClass "loaded"


		
app = new App

$ -> app.start()

module.exports = window.app = app