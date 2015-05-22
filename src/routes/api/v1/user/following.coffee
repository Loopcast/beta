_ = require 'lodash'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/following'

  config:
    description: "Returns a list with all users being followed by logged user"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 409, message: 'Error updating user name ' } # Boom.conflict
      { code: 422, message: 'Error fetching user information' } # Boom.badData
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    # validate:
    #   payload:
    #     ids  : joi.array().required()

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized 'needs authentication'

      user  = request.auth.credentials.user
      
      query = 
        user_id: user._id
        type   : 'user'
        end    : $exists: false

      Like
        .find( query )
        .select( "liked_id" )
        .lean()
        .exec ( error, response ) ->

          if error then return reply Boom.preconditionFailed error

          ids = _.pluck response, 'liked_id'

          reply ids