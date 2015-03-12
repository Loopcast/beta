module.exports = class ScrollHandler
	constructor: ( @dom ) ->

		target = $ @dom.data( 'target' )
		return if target.length <= 0

		@dom.addClass 'scroll_handler'
		
		@dom.on 'click', ->
			mover.scroll_to target

  destroy: ->
    @dom.off 'click'