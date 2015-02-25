mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  _id : Schema.Types.ObjectId
  
  info :
    username : type: String, required: true, unique: true
    name     : String
    genres   : Array
    avatar   : String
    about    : String

  stats:
    streams   : Number
    visitors  : Number
    followers : Number
    listeners : Number
    favorited : Number

  created_at: Date
  updated_at: Date
  
  data:
    email: type: String, unique: true, required: true

    facebook: Object # facebook information

    images:
      cover  : Object # cloudinary info
      profile: Object # cloudinary info

schema.pre 'save', ( next ) ->
  @created_at = @updated_at = now()

module.exports = mongoose.model 'User', schema