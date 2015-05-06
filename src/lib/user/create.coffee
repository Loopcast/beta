User = schema 'user'

module.exports = ( user, callback ) ->
  # ~ on mongodb
  doc = new User user
  doc.save ( error, user ) ->

    if error 
      console.log "error creating user ->", error
      
      return Boom.expectationFailed 'couldnt create user, please contact support'

    user = user.toObject()

    callback error, user
    
    # ~ on intercom ( happens in background )
    data =
      user_id             : user._id
      email               : user.data.email
      name                : user.info.name
      created_at          : now().unix()
      # unavailable since we got out of the request scope
      # last_seen_user_agent: request.headers[ 'user-agent' ]
      custom_attributes :
        username   : user.info.username
        facebook_id: user.data.facebook.id

    intercom.createUser data, ( error, data ) ->

      if error
        console.log "error creating user at intercom"
        console.log JSON.stringify( error, null, 2 )