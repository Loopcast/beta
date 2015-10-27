moment = require 'moment'

module.exports = (data, is_live) ->
  obj = 
    original_data : data
    data : {}
  if is_live
    obj.data = 
      _id         : data.room._id
      started_at  : data.room.status.live.started_at
      slug        : data.room.info.slug
      cover_url   : data.room.info.cover_url
      title       : data.room.info.title
      about       : data.room.info.about
      user        : data.user
      liked       : data.liked 
      is_live     : true
      url         : data.room.info.url

  else
    obj.data = 
      _id         : data.tape._id
      started_at  : moment() 
      slug        : data.tape.slug
      cover_url   : data.tape.cover_url
      title       : data.tape.title
      about       : data.tape.about
      user        : data.tape.user
      liked       : data.liked 
      is_live     : false
      url         : data.tape.s3.location

  return obj