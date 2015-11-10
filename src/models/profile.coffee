###
# Fetches public information for a given profile
###


module.exports = ( username, show_private, callback ) ->

  if username is 'undefined'

    console.log 'username is undefined!'
    console.log 'probably something wrong on the DOM triggering an undefined user'

    return callback 'undefined', null

  # if somebody types Uppercase letters, we read as lowercase
  username = username.toLowerCase()

  User
    .findOne( 'info.username': username )
    .select( "_id info likes stats")
    .lean().exec ( error, user ) ->

      if not user 

        console.log 'did not find user ' + username
        console.log 'probably something wrong somwhere, we have to patch this'

        return callback null, null

      data = 
        user  : user
        rooms : []
        tapes : []

      rooms = 
        user             : user._id
        'status.is_live' : true

      # if user is owner of the profile, see all rooms
      if show_private
        delete rooms['status.is_live']

      # change to parallel query
      Room.find( rooms ).lean().exec ( error, rooms ) ->

        if error then return callback error

        console.log "got rooms ->", rooms

        data.rooms = rooms

        tapes = 
          # don't show deleted rooms
          user   : user._id
          deleted: false
          public : true

        # if show private, then show all rooms, including
        # the not public ones
        if show_private then delete tapes.public

        Tape
          .find( tapes )
          .sort( _id: - 1 )
          .lean().exec ( error, tapes ) ->

            if error then return callback error

            data.tapes = tapes

            callback null, data

      # old code
      # recorded = 
      #   'user'               : user._id
      #   'status.is_recorded' : true
      #   'status.is_public'   : true

      # if show_private 
      #   delete recorded[ 'status.is_public' ]

      # # just shows live or recorded rooms
      # query = $or : [ live, recorded ]

      # Room.find( query ).lean().exec ( error, rooms ) ->

      #   if error then return callback error

      #   for room in rooms

      #     if room.status.is_live
      #       data.live = room
      #     else
      #       data.recorded.push room

      #   callback null, data