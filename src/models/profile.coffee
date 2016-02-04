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

  data = aware {}

  reply = ->
    
    return if not data.get 'user'
    return if not data.get 'rooms'
    return if not data.get 'tapes'
    return if not data.get 'stream_count'
    return if not data.get 'plays_count'
    

    data = 
      user         : data.get 'user'
      rooms        : data.get 'rooms'
      tapes        : data.get 'tapes'
      stream_count : data.get 'stream_count'
      plays_count  : data.get 'plays_count'

    callback null, data

  data.on 'user'        , reply
  data.on 'rooms'       , reply
  data.on 'tapes'       , reply
  data.on 'stream_count', reply

  User
    .findOne( 'info.username': username )
    .select( "_id info likes stats")
    .lean().exec ( error, user ) ->

      if not user 

        console.log 'did not find user ' + username
        console.log 'probably something wrong somwhere, we have to patch this'

        return callback null, null

      data.set 'user', user



      rooms = 
        user             : user._id
        'status.is_live' : true

      # if user is owner of the profile, see all rooms
      if show_private
        delete rooms['status.is_live']

      # change to parallel query
      Room
        .find( rooms )
        .sort( _id: - 1 )
        .lean().exec ( error, rooms ) ->

          if error
            data.set 'rooms', []

            return callback error

          data.set 'rooms', rooms

      tapes = 
        # don't show deleted rooms
        user   : user._id
        deleted: false
        public : true
        s3     : $exists: true

      # if show private, then show all rooms, including
      # the not public ones
      if show_private then delete tapes.public

      Tape
        .find( tapes )
        .sort( _id: - 1 )
        .lean().exec ( error, tapes ) ->

          if error
            data.set 'tapes', []

            return callback error

          data.set 'tapes', tapes

      query =
        user    : user._id
        duration:'$gt' : 60

      Stream.count query, ( error, count ) ->

        if error
          console.log 'error finding stream count ->', error

          data.set 'stream_count', 0
          
          return

        data.set 'stream_count', count || 0

      aggreg = [
        { $match: user: user._id },
        {
          $group: 
            _id: user._id, 
            plays: $sum: "$plays" 
        }
      ]


      Tape.aggregate aggreg, ( error, result ) ->

        if error
          console.log 'error aggregating plays ->', error

          data.set 'plays_count', 0

          return

        data.set 'plays_count', result[0]?.plays || 0