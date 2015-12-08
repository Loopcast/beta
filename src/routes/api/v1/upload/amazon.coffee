s3 = lib 's3/generate_policy_and_signature'

module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/upload/policy_and_signature'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        file_name : joi.string().required()

  handler: ( req, reply )->

    if not req.auth.isAuthenticated

      return reply Boom.unauthorized('needs authentication')

    username  = req.auth.credentials.user.username
    file_name = req.payload.file_name

    file_name = "#{username}/#{file_name}"

    police      = s3.get_police( file_name )

    credentials = s3.get_credentials( police )

    reply
      file_name  : file_name
      credentials: credentials

