mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  # _id of the room where this stream was originated
  user_id    : type: Schema.Types.ObjectId, required: on
  room_id    : type: Schema.Types.ObjectId, required: on

  likes      : { type: Number, default: 0 }

  plays      : { type: Number, default: 0 }

  # recording sets are private by default
  public     : { type: Boolean, default: off }

  started_at : Date
  stopped_at : Date

  s3         : Object


module.exports = mongoose.model 'Tape', schema