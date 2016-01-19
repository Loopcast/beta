module.exports = ( liked_id, callback ) ->

  console.log 'arguments ->', arguments
  
  query =
    liked_id: liked_id
    end     : $exists: false

  Like
    .find( query )
    .select( "user_id" )
    .lean().exec ( error, response ) ->

      if error then return callback error

      response = _.map response, "user_id"

      query = 
        _id               : $in: response
        'data.facebook.id': $exists: true

      User
        .find( query )
        .select( 'data.facebook.id' )
        .lean().exec ( error, response ) ->

          response = _.map response, "data.facebook.id"

          callback error, response