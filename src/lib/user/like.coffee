increase_like = lib 'user/increase_like'

module.exports = ( user_id, following_id, callback ) ->

  doc =
    user_id  : user_id
    type     : 'user'
    liked_id : following_id
    start    : now().toDate()

  like = new Like doc

  like.save ( error, doc ) ->

    if error then return callback error

    # +1 on the counter
    increase_like following_id, 1

    callback null, doc.toObject()