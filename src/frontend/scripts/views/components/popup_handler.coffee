module.exports = class PopupHandler
	constructor: ( @dom ) ->
		@url     = @dom.data 'url'
		@title   = @dom.data 'title'
		@w       = @dom.data 'w'
		@h       = @dom.data 'h'

		@dom.on 'click', @open
		
	open: ( ) =>
		left = (app.window.w/2)-(@w/2);
		top = (app.window.h/2)-(@h/2);

		params = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+@w+', height='+@h+', top='+top+', left='+left

		log "params", params
		log "url", @url
		log "title", @title

		return window.open(@url, @title, params).focus();

