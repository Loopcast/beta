# utils / helpers
# window.delay  		= require './utils/delay'
# window.log  		= require './utils/log'
# MediaQuery 			= require './utils/media_query'

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

		@body   = $ 'body'
		
		# @settings = require 'app/utils/settings'
		# @settings.bind @body

		# Resize management
		@win.obj = $ window
		@win.obj.on 'resize', @on_resize
		delay 100, @on_resize


		# Controllers binding
		do views.bind
		# do navigation.bind
		



	###
	# After the views have been rendered
	###
	after_render: ( ) =>
		# Hide the loading
		delay 10, => 
			@body.addClass "loaded"


	on_resize: ( ) =>
		@win.w = @win.obj.width()
		@win.h = @win.obj.height()

		@topbar_h = @navbar.height()

		@emit 'resize'


		
app = new App

$ -> app.start()

module.exports = window.app = app