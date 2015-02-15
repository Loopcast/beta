module.exports = ( data ) ->
	left = (app.window.w/2)-(data.w/2)
	top = (app.window.h/2)-(data.h/2)

	params = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+data.w+', height='+data.h+', top='+top+', left='+left

	return window.open(data.url, data.title, params).focus();