BrowserDetect = require 'app/utils/browser'

settings = 

	# Browser id, version, OS
	browser: {

		# ID [String]
		id: BrowserDetect.browser

		# Version [String]
		version: BrowserDetect.version
		
		# OS [String]
		OS: BrowserDetect.OS
		
		# Is Chrome? [Boolean]
		chrome: (navigator.userAgent.toLowerCase().indexOf( 'chrome' ) > -1)

		# Is Firefox [Boolean]
		firefox: (/Firefox/i.test(navigator.userAgent))

		# Is IE8? [Boolean]
		ie8: false

		# Device ratio [Number]
		device_ratio: window.devicePixelRatio

		# Is a handheld device? [Boolean]
		handheld: false

		# Is a tablet? [Boolean]
		tablet: false
		
		# Is a mobile? [Boolean]
		mobile: false

		# Is desktop? Set after the class definition [Boolean]
		desktop: false

		# Is a tablet or mobile? [Boolean]
		device: false

		# Debug mode - set by env in index.php
		debug: false

		css_cover_supported: Modernizr.backgroundsize

		min_size:
			w: 900
			h: 400
	}

	# Use this flag if were doing keyframe animations
	# otherwise implement a js fallback

	# Webp support
	webp: false

settings.theme = "desktop"
settings.threshold_theme = 700

settings.browser_unsupported = settings.browser.id is "Explorer" and settings.browser.version < 10

# settings.browser_unsupported = true


# Retina supported [Boolean]
settings.browser.retina = settings.browser.device_ratio is 2

# Webp test
if settings.browser.chrome and settings.browser.version >= 30
	settings.webp = true

# Flags for IE
if settings.browser.id is 'Explorer' 
	settings.browser.ie = true
	if settings.browser.version is 8
		settings.browser.ie8 = true
	if settings.browser.version is 9
		settings.browser.ie9 = true


# If it's an handheld device
settings.video_active = settings.browser.id isnt 'Explorer'



if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
	settings.browser.handheld = true

	# Check if it's mobile or tablet calculating ratio and orientation
	ratio = $(window).width()/$(window).height()
	settings.browser.orientation = if ratio > 1 then "landscape" else "portrait"

	# check max width for mobile device (nexus 7 included)
	if $(window).width() < 610 or (settings.browser.orientation is "landscape" and ratio > 2.10 )
		settings.browser.mobile = true
		settings.browser.tablet = false
	else
		settings.browser.mobile = false
		settings.browser.tablet = true

settings.browser.device = (settings.browser.tablet or settings.browser.mobile)

# Set desktop flag
if settings.browser.tablet is false and  settings.browser.mobile is false
	settings.browser.desktop = true


settings.browser.windows_phone = false
if settings.browser.mobile and settings.browser.id is 'Explorer'
	settings.browser.windows_phone = true


settings.touch_device = settings.browser.handheld

# Platform specific events map
settings.events_map =
	'down' : 'mousedown'
	'up'   : 'mouseup'
	'move' : 'mousemove'

if settings.browser.device

	if settings.browser.windows_phone
		settings.events_map =
			'down' : 'MSPointerDown'
			'up'   : 'MSPointerUp'
			'move' : 'MSPointerMove'
			
	else
		settings.events_map =
			'down' : 'touchstart'
			'up'   : 'touchend'
			'move' : 'touchmove'




# Platform class
if settings.browser.desktop
	platform = 'desktop'
else if settings.browser.tablet
	platform = 'tablet'
else
	platform = 'mobile'


settings.after_login_url = ""
settings.after_logout_url = ""

# Browser class for the body
settings.browser_class = settings.browser.id + '_' + settings.browser.version

has3d = ->
	el = document.createElement("p")
	has3d = undefined
	transforms =
		webkitTransform: "-webkit-transform"
		OTransform: "-o-transform"
		msTransform: "-ms-transform"
		MozTransform: "-moz-transform"
		transform: "transform"


	# Add it to the body to get the computed style.
	document.body.insertBefore el, null
	for t of transforms
		if el.style[t] isnt `undefined`
			el.style[t] = "translate3d(1px,1px,1px)"
			has3d = window.getComputedStyle(el).getPropertyValue(transforms[t])
	document.body.removeChild el
	has3d isnt `undefined` and has3d.length > 0 and has3d isnt "none"


# settings.has3d = has3d()



settings.bind = (body)->
	klasses = []
	klasses.push settings.browser_class
	klasses.push settings.browser.OS.replace( '/', '_' )
	klasses.push settings.browser.id

	if settings.touch_device
		klasses.push "touch_device"
	else
		klasses.push "no_touch_device"

	if settings.browser.css_cover_supported
		klasses.push "css_cover_supported"

	body.addClass klasses.join( " " ).toLowerCase()

	settings.header_height = $( 'header' ).height()
	# body.css 
	# 	'min-width'  : settings.browser.min_size.w
	# 	'min-height' : settings.browser.min_size.h



# TEMP

# settings.video_active = false
# settings.css_cover_supported = false

settings.use_appcast = true


module.exports = settings