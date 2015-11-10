module.exports = ( Model, _id, amount, callback ) ->

  update = $inc: 'likes': amount

  Model
    .update( _id: _id, update )
    .lean().exec ( error, docs_updated ) ->

      if error

        console.log "error increasing likes by #{amount} for #{Model.modelName} model"

        return callback? error

      callback? error, docs_updated