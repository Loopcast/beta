module.exports = ( user_id, amount, callback ) ->

  update = $inc: 'likes': amount

  User.update( _id: user_id, update )
    .lean()
    .exec ( error, docs_updated ) ->

      if error then return callback? error

      callback? error, docs_updated