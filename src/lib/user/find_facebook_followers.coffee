module.exports = ( liked_id, callback ) ->


  console.log 'find facebook followers for', liked_id

  query =
    liked_id: liked_id
    end     : $exists: false

  Like
    .find( query )
    .select( "user_id" )
    .lean().exec ( error, response ) ->

      if error then return callback error

      response = _.map response, "user_id"

      console.log "found followers", response

      query = 
        _id               : $in: response
        'data.facebook.id': $exists: true

      User
        .find( query )
        .select( 'data.facebook.id' )
        .lean().exec ( error, response ) ->



          console.log "got facebook ids!!"
          console.log response
          console.log 'asdasdsad'

          callback error, response