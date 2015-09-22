module.exports =
  method : 'PUT'
  path   : '/api/v1/tape/{id}'

  config:
    description: "Edit a properties of a tape"
    plugins: "hapi-swagger": responseMessages: [
      { code: 200, message: 'OK' }
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        public : joi.boolean()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      tape_id = req.params.id
      user_id = req.auth.credentials.user._id

      payload = req.payload

      query =
        _id  : tape_id
        user : user_id

      # if nothing is being updated, only return 200 OK
      if not payload.public?

        reply ok: 1

        return

      update = {}

      if payload.public?

        update.public = payload.public
        
      Tape
        .update( query, update )
        .lean()
        .exec ( error, docs_updated ) ->

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          console.log 'docs_updated ->', docs_updated

          reply docs_updated