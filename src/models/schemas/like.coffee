mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  # _id of the user owning the room
  user_id  : { type: Schema.Types.ObjectId, required: on }
  liked_id : { type: Schema.Types.ObjectId, required: on }
  type     : { type: String               , required: on }
  start    : { type: Date                 , required: on }
  end      : { type: Date                                }

Like = mongoose.model 'Like', schema

# TODO:
# make a compound index on user_id and type ?
schema.index 
  user_id : 1
  type    : 1
  end     : 1


#
# hooks
#


schema.pre 'save', ( next, done ) ->

  doc = @

  query = 
    user_id : @user_id
    liked_id: @liked_id
    type    : @type
    end     : $exists: false

  Like.find( query, _id: off )
    .select( "_id" )
    .lean()
    .exec ( error, likes ) -> 
      if error then failed null, null, error

      if likes.length
        
        doc.invalidate 'url', 'cant like it before unlike it'

        return done new Error( 'already_liked' )

      next()

module.exports = Like