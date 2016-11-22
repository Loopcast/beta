done = false

module.exports = ( $dom ) ->

  return if done

  done = true

  $dom.find('.fileupload').eq(0).change (e) ->

    filename = $dom.find( '.fileupload' ).val()
    filename = filename.split('/').pop().split('\\').pop()


    api.loopcast.upload.policy_and_signature filename, ( error, r ) ->


      console.log 'r ->', r

      options =
        url       : $( ".s3-bucket" ).val()

        type      : 'POST'
        autoUpload: true

        formData:
          key                  : r.file_name
          AWSAccessKeyId       : r.credentials.key
          acl                  : "public-read",
          policy               : r.credentials.policy
          signature            : r.credentials.signature
          success_action_status: "201"

        progressall: (e, data) ->
          progress = parseInt(data.loaded / data.total * 100, 10);

          console.log 'progress ->', progress
          console.log 'progress ->', progress
          console.log 'progress ->', progress


        done: (e, data) ->
          console.log('testing')


      $('.fileupload').fileupload( options )

      console.log 'called upload with options ->', options


# old CORS @ S3
# <?xml version="1.0" encoding="UTF-8"?>
# <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
#     <CORSRule>
#         <AllowedOrigin>*</AllowedOrigin>
#         <AllowedMethod>GET</AllowedMethod>
#         <MaxAgeSeconds>86400</MaxAgeSeconds>
#         <AllowedHeader>Authorization</AllowedHeader>
#     </CORSRule>
# </CORSConfiguration>
