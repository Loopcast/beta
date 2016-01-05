mongoose = require( 'mongoose')
SlugHero = require('mongoose-slug-hero')

Schema   = mongoose.Schema

schema = new Schema

  # owner of this recording
  user      : type: Schema.Types.ObjectId, required: on, ref: 'User'

  # _id of the room where this recording was originated
  # if no room is defined, it's an uploaded
  room      : type: Schema.Types.ObjectId, ref: 'Stream'

  # slug used as the recording URL
  # slug      : type: String

  title     : type: String
  genres    : type: Array
  location  : String
  about     : String
  cover_url : String


  likes      : { type: Number, default: 0 }

  plays      : { type: Number, default: 0 }

  # recording sets are private by default
  public     : { type: Boolean, default: false }

  # true if the user deleted the tape from this profile
  deleted    : { type: Boolean, default: false }

  # true if there was an error when stop recording
  error    : Object

  started_at : Date
  stopped_at : Date
  duration   : Number

  # s3 information which comes back from the tape recorder
  s3         : Object


schema.plugin SlugHero, doc: 'tape', field: 'title', scope: ['user']

module.exports = mongoose.model 'Tape', schema


text_indexes = 
  'slug'    : 'text'
  'title'   : 'text'
  'genres'  : 'text'
  'location': 'text'
  'about'   : 'text'

mongoose.connection.collections['tapes'].ensureIndex text_indexes, ( error ) ->

  if error
    console.error "error indexing fields for text search"
    console.error error
    return 