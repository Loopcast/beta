module.exports = ( user, callback ) ->

  # fetch user data from intercom
  intercom.getUser user_id: user._id, ( error, response ) ->

    if error then return callback error

    data = 
      user_id          : user._id
      custom_attributes: {}

    if user[ 'name' ]
      data.name = user[ 'name' ]

    if user[ 'occupation' ]
      data.custom_attributes.occupation = user[ 'occupation' ].join( "," )

    if user[ 'genres' ]
      data.custom_attributes.genres = user[ 'genres' ].join( "," )


    # left bar info
    if user[ 'location' ]

      data.custom_attributes.location = user[ 'location' ]

    # top info on profile page
    if user[ 'info.username' ]
      data.custom_attributes.username = user[ 'info.username' ]

    if user[ 'about' ]

      data.custom_attributes.about = user[ 'about' ]

    if user[ 'social' ]

      data.custom_attributes.social = user[ 'social' ].join( "," )

    # we won't save avatar as this won't refresh intercom information
    if user[ 'info.avatar' ]
      data.custom_attributes.avatar = user.info.avatar

    intercom.updateUser data, ( error, res ) ->

      if error then return callback error