mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema

  # owner of this recording
  user       : type: Schema.Types.ObjectId, required: on, ref: 'User'

  # _id of the room where this recording was originated
  room       : type: Schema.Types.ObjectId, required: on, ref: 'Stream'

  # slug used as the recording URL
  slug       : type: String

  title     : type: String, required: on
  genres    : { type: Array, default: [] }
  location  : String
  about     : String
  cover_url : String



  likes      : { type: Number, default: 0 }

  plays      : { type: Number, default: 0 }

  # recording sets are private by default
  public     : { type: Boolean, default: off }

  # true if the user deleted the tape from this profile
  deleted    : { type: Boolean }

  started_at : Date
  stopped_at : Date

  # filename being used on S3
  filename   : String

  # s3 information which comes back from the tape recorder
  s3         : Object


module.exports = mongoose.model 'Tape', schema