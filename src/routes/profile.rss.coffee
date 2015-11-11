###

Generate an RSS file for iTunes PodCast.

following guide from:  https://blog.idrsolutions.com/2014/08/create-rss-feed/

###

module.exports =
  method: 'GET'
  path  : '/{profile}.rss'

  config:

    handler: ( req, reply )->

      profile = req.params.profile

      rss  = ""

      rss += """
        <?xml version="1.0" encoding="utf-8"?>"
        <rss 
          xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
          version="2.0"
          xmlns:atom="http://www.w3.org/2005/Atom"
        >
        <channel>
          <title>This is our Feed title</title>
          <link>#{s.base_path}/#{profile}</link>
          <description>This will be a breif description of your podcast</description>
          <language>en-us</language>
           <copyright>IDRSolutions copyright 2014</copyright>

           <
            atom:linkhref="http://www.files.idrsolutions.com/podcast.rss"
            rel="self"
            type="application/rss+xml" 
          />

           <lastBuildDate>Wed, 13 Aug 2014 15:47:00 GMT</lastBuildDate>
           <itunes:author>IDRSolutions</itunes:author>
           <itunes:summary>Our First itunes feed</itunes:summary>
          <itunes:owner>
            <itunes:name>IDRSolutions</itunes:name>
            <itunes:email>contact2007@idrsolutions.com</itunes:email>
          </itunes:owner>
          <itunes:explicit>No</itunes:explicit>
          <itunes:imagehref="http://files.idrsolutions.com/Java_PDF_Podcasts/idrlogo.png"/>
          <itunes:categorytext="Technology"> </itunes:category>
        </channel>
      """

      reply( rss ).type( "application/rss+xml" )