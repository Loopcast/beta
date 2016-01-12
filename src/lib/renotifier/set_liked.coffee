module.exports = ( follower_name, tape_slug, followed_id ) ->
 
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

      message = "Congrats... #{follower_name} just liked your mix!"
      url     = s.base_path + "/r/#{tape_slug}"

      data =
        url                : s.renotifier.api.url + '/trigger'

        rejectUnauthorized : false
        strictSSL          : false

        headers :
          Authorization  : "Token #{s.renotifier.api.token}"
        
        form:
          trigger_id    : 37
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