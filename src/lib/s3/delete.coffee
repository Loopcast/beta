# node package: https://github.com/andrewrk/node-s3-client

# S3 documentation: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property

module.exports = ( object_id, callback ) ->

  console.log "deleting #{object_id} from S3"

  params = 
    Bucket: s.s3.bucket
    Delete:
      Objects: [ {
        Key: object_id
      } ]
      Quiet: true # not sure what this means

    RequestPayer: 'requester'
    
  request = s3.deleteObjects params

  request.on 'error', ( error ) ->

    console.log "error deleting #{object_id} from S3"
    console.log arguments

    callback error

  request.on 'end', ->

    console.log "deleted fro S3!!!"
    console.log arguments

    callback null, null

  request.on 'data', ( data ) ->

    console.log "got data from s3"
    console.log data