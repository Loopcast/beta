Opacity = 
	show: (el, time = 500) ->
		# log "[Opacity] show"
		el.fadeIn time
		# t = Opacity.get_time( time )
		# el.css 
		# 	'visibility' : "visible"
		# 	'transition' : "opacity #{t} linear"

		# delay 1, ->
		# 	el.css 'opacity', 1

	hide: ( el, time = 500 ) ->
		# log "[Opacity] hide"
		el.fadeOut time

		# t = Opacity.get_time time
		# t1 = Opacity.get_time( time + 100 )

		# el.css 'transition', "opacity #{t} linear"
		# delay 1, -> el.css 'opacity', 0
		# delay t1, -> el.css 'visibility', 'hidden'

	get_time: ( time ) ->
		return (time/1000) + "s"

module.exports = Opacity