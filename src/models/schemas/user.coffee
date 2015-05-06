mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  info :
    username   : type: String, required: true, unique: true
    name       : String
    avatar     : String
    cover      : String
    genres     : type: Array, default: []
    occupation : type: Array, default: []
    social     : type: Array, default: []
    about      : String
    location   : String

  stats:
    followers : type: Number, default: 0
    streams   : type: Number, default: 0
    listeners : type: Number, default: 0

  created_at: Date
  updated_at: Date
  
  data:
    email: type: String, unique: true

    facebook: Object # facebook information
      id   : String
      email: String

User = mongoose.model 'User', schema

text_indexes = 
  'info.name'       : 'text'
  'info.genres'     : 'text'
  'info.occupation' : 'text'
  'info.social'     : 'text'
  'info.about'      : 'text'
  'info.location'   : 'text'

mongoose.connection.collections['users'].ensureIndex text_indexes, ( error ) ->

  if error
    console.error "error indexing fields for text search"
    console.error error
    return 

schema.pre 'save', ( next ) ->
  @updated_at = now()

  next()

module.exports = User