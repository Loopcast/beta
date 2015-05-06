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

schema.pre 'save', ( next ) ->
  @updated_at = now()

  next()

module.exports = mongoose.model 'User', schema