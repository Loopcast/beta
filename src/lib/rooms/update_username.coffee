# if user updates his username, we must update his info in all rooms
# because when searching for rooms we also need to consider username

module.exports = ( user_id, username, callback ) ->

	conditions = user  : user_id
	options    = multi : true
	update     = $set  : 'info.user': username
		

	Room.update conditions, update, options, ( error, updated ) ->

		if error then return callback error

		callback error, updated