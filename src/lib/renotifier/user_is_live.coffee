find_followers  = lib 'user/find_facebook_followers'

module.exports = ( followed_id, room_slug ) ->
 
  data = aware {}

  notify = ->

    return if not data.get 'users'
    return if not data.get 'user'

    user  = data.get 'user'
    users = data.get 'users'

    message = "#{user.info.name} just went live!"
    url     = s.base_path + "/#{user.info.username}/#{room_slug}"

    data =
      url                : s.renotifier.api.url + '/trigger'

      rejectUnauthorized : false
      strictSSL          : false

      headers :
        Authorization  : "Token #{s.renotifier.api.token}"
      
      form:
        trigger_id    : 34
        facebook_id   : users.join ","
        message       : message
        url           : url
        url_in_canvas : false

    request.post data, ( error, response, body ) ->

      if error or response.statusCode != 201

        console.log "error notifying user is live"
        console.log "statusCode: #{response.statusCode}"
        console.log '---'
        console.log body
        console.log '---'
        
  find_followers followed_id, ( error, users ) ->

    console.log 'got users ->', users

    data.set 'users', users

  User
    .findOne( _id: followed_id )
    .select( "info.name info.username" )
    .lean().exec ( error, user ) ->

      console.log 'got user ->', user

      data.set 'user', user

  data.on 'user' , notify
  data.on 'users', notify