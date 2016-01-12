module.exports = ( tape_id ) ->
 

  Tape
    .findOne( _id: tape_id )
    .select( "user slug" )
    .populate( 'user', '_id info.name info.username' )
    .lean().exec ( error, tape ) ->

      user_id   = tape.user._id
      name      = tape.user.info.name
      username  = tape.user.info.username
      tape_slug = tape.slug


      # find all facebook ids that liked this tape
      return

  query = 
    _id: followed_id
    'data.facebook.id': $exists: true

  User
    .findOne( query )
    .select( "data.facebook.id" )
    .lean().exec ( error, user ) ->

      if error
        console.error "Error notifying #{followed_id}"
        console.log error

        return

      # not a facebook user, can't send fb notification
      if not user then return

      message = "#{name} just published a mix!"
      url     = s.base_path + "/r/username/#{tape_slug}"

      data =
        url                : s.renotifier.api.url + '/trigger'

        rejectUnauthorized : false
        strictSSL          : false

        headers :
          Authorization  : "Token #{s.renotifier.api.token}"
        
        form:
          trigger_id    : 35
          facebook_id   : user.data.facebook.id
          message       : message
          url           : url
          url_in_canvas : false

      request.post data, ( error, response, body ) ->

        if error or response.statusCode != 201

          console.log "error notifying user following"
          console.log "statusCode: #{response.statusCode}"
          console.log '---'
          console.log body
          console.log '---'

          return callback? error