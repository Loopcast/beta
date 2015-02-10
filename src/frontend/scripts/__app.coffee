$ ->
	overlay = $( '.md_overlay' )


	$( '.md_trigger' ).on 'click', ->
		$this = $ @
		modal = $( '#' + $this.data( 'modal' ) )

		removeModal = ( ) ->
			modal.removeClass 'md_show'

		modal.addClass 'md_show'
		overlay.on 'click', removeModal



	$( '.md_trigger' ).click()
