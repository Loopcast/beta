module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/upload/create'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    # validate:
    #   payload:
    #     room_id : joi.string().required()

  handler: ( req, reply )->

    if not req.auth.isAuthenticated

      return reply Boom.unauthorized('needs authentication')

    user_id = req.auth.credentials.user._id

    upload = new Tape user: user_id

    upload.save ( error, doc ) ->

      if error 
        console.log "error creating tape document"
        console.log error
        
        return reply Boom.badImplementation( error.message, error )

      reply doc