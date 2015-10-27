###

Return image files

###

path = require 'path'

module.exports = 

  method: 'GET'
  path  : '/download/{file}'

  handler: ( request, reply ) ->

    root = path.join __dirname, '../../../public/download'

    file = request.params.file

    if file.indexOf( ".zip" ).indexOf != -1

      # set header as application/zip when a zipfile is downloaded
      reply.file( root + '/' + file ).type( "application/x-zip-compressed" )

    else

      reply.file( root + '/' + file )