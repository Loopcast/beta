module.exports = ( user, callback ) ->

  data = 
    user_id          : user._id
    custom_attributes: {}

  if user[ 'info.name' ]
    data.name = user[ 'info.name' ]

  if user[ 'info.occupation' ]
    data.custom_attributes.occupation = user[ 'info.occupation' ].join( "," )

  if user[ 'info.genres' ]
    data.custom_attributes.genres = user[ 'info.genres' ].join( "," )


  # left bar info
  if user[ 'info.location' ]

    data.custom_attributes.location = user[ 'info.location' ]

  # top info on profile page
  if user[ 'info.username' ]
    data.custom_attributes.username = user[ 'info.username' ]

  if user[ 'info.about' ]

    data.custom_attributes.about = user[ 'info.about' ]

  if user[ 'info.social' ]

    data.custom_attributes.social = user[ 'info.social' ].join( "," )

  intercom.updateUser data, ( error, res ) ->

    if error then return callback error