###

Return image files

###

path = require 'path'

module.exports = 

  method: 'GET'
  path  : '/download/{file}'

  handler: ( request, reply ) ->

    root = path.join __dirname, '../../../public/download'

    if file.indexOf( ".zip" ).indexOf != -1

      # set header as application/zip when a zipfile is downloaded
      reply.file( root + '/' + request.params.file ).type( "application/zip" )

    else

      reply.file( root + '/' + request.params.file )