# node package: https://github.com/andrewrk/node-s3-client

# S3 documentation: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property

module.exports = ( object_id, callback ) ->

  params = 
    Bucket: s.s3.bucket
    Key   : object_id
    ACL   : 'private'
    
  request = s3.putObjectAcl params

  # error deleting from s3
  request.on 'error', ( error ) -> callback error

  # successfuly deleted!
  request.on 'end', -> callback?()