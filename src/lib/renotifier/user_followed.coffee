module.exports = ( follower_name, username, following_id ) ->
 
  query = 
    _id: following_id
    'data.facebook.id': $exists: true

  User
    .findOne( query )
    .select( "data.facebook.id" )
    .lean().exec ( error, user ) ->

      if error
        console.error 'no user for following_id'
        return

      if not user

        console.log 'user isnt a facebook user'

        return

      console.log 'renotifier follow message'
      console.log follower_name, username, following_id

      message = "Congrats... #{follower_name} just followed you!"
      url     = s.base_path + "/#{username}"

      data =
        url                : s.renotifier.api.url + '/trigger'

        rejectUnauthorized : false
        strictSSL          : false

        headers :
          Authorization  : "Token #{s.renotifier.api.token}"
        
        form:
          trigger_id    : 36
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

        else

          console.log '---'
          console.log body
          console.log '---'

          callback? null