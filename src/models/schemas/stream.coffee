mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  # _id of the room where this stream was originated
  user       : type: Schema.Types.ObjectId, required: on
  room       : type: Schema.Types.ObjectId, required: on

  likes      : { type: Number, default: 0 }

  listeners  : { type: Number, default: 0 }

  # a stream might be private for PRO users in the future
  public     : { type: Boolean, default: on }

  # true if our servers detected the stream went offline
  # without the user pressing STOP STREAM
  dropped    : { type: Boolean }

  started_at : Date
  stopped_at : Date

  url        : String

module.exports = mongoose.model 'Stream', schema