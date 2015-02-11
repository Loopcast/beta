module.exports = class PopupHandler
	constructor: ( @dom ) ->
		url   	= @dom.data 'url'
		title  	= @dom.data 'title'
		w  		= @dom.data 'w'
		h  		= @dom.data 'h'

		@dom.on 'click', ->
			left = (app.window.w/2)-(w/2);
			top = (app.window.h/2)-(h/2);
			return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
