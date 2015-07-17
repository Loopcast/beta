mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  info :
    username   : type: String, required: true, unique: true
    name       : type: Array , default: ""
    avatar     : String
    cover      : String
    genres     : type: Array, default: []
    occupation : type: Array, default: []
    social     : type: Array, default: []
    about      : type: Array, default: ""
    location   : type: Array, default: ""

  # is actually the amount of followers the user has
  likes       : { type: Number, default: 0 }
  
  stats:
    streams   : type: Number, default: 0
    listeners : type: Number, default: 0


  socket_id    : { type: String, unique: true }

  created_at: Date
  updated_at: Date
  
  data:
    email: type: String, unique: true

    facebook: Object # facebook information
      id   : String
      email: String

    appcast: Object
      version: String

User = mongoose.model 'User', schema

schema.index 
  socket_id : 1

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