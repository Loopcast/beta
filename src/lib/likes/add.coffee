increase = lib 'likes/increase'

module.exports = ( user_id, Model, liked_id, callback ) ->

  doc =
    user_id  : user_id
    # use mongoose model name to lower case as type for the like record
    # basically we can like any Model we ever created ( :
    type     : Model.modelName.toLowerCase() 
    liked_id : liked_id
    start    : now().toDate()

  like = new Like doc

  like.save ( error, doc ) ->

    if error then return callback error

    if doc.nModified > 0
      # +1 on the counter
      increase Model, liked_id, 1

    callback null, doc.toObject()