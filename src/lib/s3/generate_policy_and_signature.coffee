# example copied from:
# https://gist.github.com/nosolopau/4723662#file-s3-js
# var policy = S3.generateS3Policy("user_" + req.user.id);
# var credentials = S3.generateS3Credentials(policy);

crypto = require('crypto')
moment = require('moment')

s3 = 
  generateS3Policy: (fileName) ->

    s3Policy = {
      'conditions': [
        {
          'bucket': CONF.s3.bucket
        }, ['starts-with', '$key', 'uploads/' + fileName], {
          'acl': 'public-read'
        }, {
          'success_action_redirect': 'http://' + CONF.host + '/upload_done'
        }, ['content-length-range', 0, CONF.s3.policy.maxSize], ['starts-with', '$Content-Type', 'image']
      ],
      'expiration': moment().add('minutes', CONF.s3.uploadWindow).format('YYYY-MM-DDTHH:MM:ss\\Z')
    }

  generateS3Credentials: (s3Policy) ->
    encodedPolicy = new Buffer(JSON.stringify(s3Policy)).toString('base64')

    credentials = 
      policy      : encodedPolicy
      signature   : crypto.createHmac('sha1', CONF.s3.secretKey).update(encodedPolicy).digest('base64')
      key         : CONF.s3.key
      redirect    : 'http://' + CONF.host + '/upload_done'
      plain_policy: s3Policy

module.exports = s3