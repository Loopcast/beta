moment = require 'moment'

module.exports = (data, is_live) ->
  obj =
    original_data : data
    data : {}
  
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

  return obj
