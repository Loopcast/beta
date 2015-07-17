###
# Fetches public information for a given profile
###


User = schema 'user'
Room = schema 'room'

module.exports = ( id, callback ) ->

  if id is 'undefined'

    console.log 'id is undefined!'
    console.log 'probably something wrong on the DOM triggering an undefined user'

    return callback 'undefined', null

  # if somebody types Uppercase letters, we read as lowercase
  id = id.toLowerCase()

  User
    .findOne( 'info.username': id )
    .select( "_id info likes stats")
    .lean().exec ( error, user ) ->

      if not user 

        console.log 'did not find user ' + id
        console.log 'probably something wrong somwhere, we have to patch this'

        return callback null, null

      data = 
        user : user
        recorded  : []
        live      : null

      # just shows live or recorded rooms
      query = 
        $or      : [
          { 'user' : user._id, 'status.is_live'     : true }
          { 'user' : user._id, 'status.is_recorded' : true }
        ]

      Room.find( query ).lean().exec ( error, rooms ) ->

        if error then return callback error

        for room in rooms

          if room.status.is_live
            data.live = room
          else
            data.recorded.push room

        callback null, data