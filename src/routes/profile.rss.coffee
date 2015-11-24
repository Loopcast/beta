###

Generate an RSS file for iTunes PodCast.

following guide from:  https://blog.idrsolutions.com/2014/08/create-rss-feed/

###

template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/{profile}.rss'

  config:

    handler: ( req, reply )->

      profile = req.params.profile

      template "profile.rss", {}, ( error, callback ) ->

        if error
          console.log "error ->", error

        console.log "got template!"

        reply( rss ).type( "application/rss+xml" )