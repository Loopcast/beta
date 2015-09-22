increase = lib 'likes/increase'

module.exports = ( user_id, Model, unliked_id, callback ) ->

  doc =
    user_id  : user_id
    # use mongoose model name to lower case as type for the like record
    # basically we can like any Model we ever created ( :
    type     : Model.modelName.toLowerCase() 
    liked_id : unliked_id
    end      : $exists: false

  update = end: now().toDate()

  Like
    .update( doc, update )
    .lean()
    .exec ( error, docs ) ->

      if error then return callback error

      if docs.nModified > 0
        # -1 on the counter
        increase Model, unliked_id, -1

      callback null, 
        ok      : true
        modified: docs.nModified