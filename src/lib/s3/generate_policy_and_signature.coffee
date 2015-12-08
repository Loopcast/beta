crypto = require('crypto')
moment = require('moment')

redirect = "#{s.base_path}/api/v1/upload/callback/amazon_done"

if not s.is_beta
  redirect = "http://staging.loopcast.fm/api/v1/upload/callback/amazon_done"

s3 = 
  get_police: ( file_name ) ->


    expires = moment()
      .add( 'minutes', 20 * 60 )
      .format( 'YYYY-MM-DDTHH:MM:ss\\Z' )

    s3Policy = {
      'conditions': [
        { 'bucket': s.s3.bucket }, 
        [ 'starts-with', '$key', "#{file_name}" ], 
        { 'acl': 'public-read' }, 
        { 'success_action_redirect': redirect }, 
        [ 'content-length-range', 0, 10485760000 ], # 10.48gb i hope!
        [ 'starts-with', '$Content-Type', 'audio' ]
      ],
      'expiration': expires
    }

  get_credentials: ( police ) ->
    encodedPolicy = new Buffer( JSON.stringify( police ) ).toString('base64')

    credentials = 
      policy      : encodedPolicy
      signature   : crypto.createHmac('sha1', s.s3.secret).update(encodedPolicy).digest('base64')
      key         : s.s3.key
      redirect    : redirect
      plain_policy: police

module.exports = s3