class Mover
	scroll_to : (el, with_topbar = false, speed = 300) ->

		y = el.position().top

		log "[Mover] scroll_to", y
		@scroll_to_y y, with_topbar, speed
		

	scroll_to_y: (y, with_topbar = true, speed = 300) ->
		if with_topbar
			y -= app.settings.header_height

		log "[mover] scroll_to_y", y
		
		$( 'html, body' ).animate scrollTop: y, speed

mover = new Mover

module.exports = window.mover = mover