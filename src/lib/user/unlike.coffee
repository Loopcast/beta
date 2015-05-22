increase_like = lib 'user/increase_like'

module.exports = ( user_id, following_id, callback ) ->

  doc =
    user_id  : user_id
    type     : 'user'
    liked_id : following_id
    end      : $exists: false

  update = end: now().toDate()

  Like.update( doc, update )
    .lean()
    .exec ( error, docs_updated ) ->

      if error then return callback error

      # +1 on the counter
      increase_like following_id, -1

      callback null, ok: docs_updated