mongoose = require 'mongoose'
User     = require '../src/models/schemas/user'

url = ""

if not url.length then return

mongoose.connect url, ( error ) ->

  if error
    console.log 'error ->', error

  console.log 'connected!'

  query = 'info.location.0': $exists : true

  User.find query, ( error, users ) ->

    if error
      console.log 'error finding users ->', error

    console.log "found #{users.length} users!"

    i = 0

    for user in users

      # console.log 'user.save ->', user.save
      # console.log 'user.info.location ->', user._id

      update = 'info.location': ''

      User.update _id: user._id, update, ( error, ok ) ->

        if error
          console.log error

    console.log 'all users!'