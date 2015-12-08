extract_id   = lib 'cloudinary/extract_id'
delete_image = lib 'cloudinary/delete'

module.exports =
  method : 'GET'
  path   : '/api/v1/upload/callback/amazon_done'

  config:
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      console.log "AMAZON UPLOAD DONE CALLBACK!"
      
      reply ok: 1