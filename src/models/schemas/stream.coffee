mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema

  # owner of this recording
  user       : type: Schema.Types.ObjectId, required: on, ref: 'User'

  # _id of the room where this recording was originated
  room       : type: Schema.Types.ObjectId, required: on, ref: 'Stream'

  # we probably won't have likes on streaming sessions
  likes      : { type: Number }

  listeners  : { type: Number, default: 0 }

  # true if our servers detected the stream went offline
  # without the user pressing STOP STREAM
  dropped    : { type: Boolean }

  started_at : Date
  stopped_at : Date
  duration   : Number

  url        : String

module.exports = mongoose.model 'Stream', schema