module.exports = ->
	log.history = log.history or [] # store logs to an array for reference
	log.history.push arguments

	if console?
		console.log Array::slice.call(arguments)