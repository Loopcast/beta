mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  _id : Schema.Types.ObjectId
  info :
    id        : String # ie: thomas-amundsen
    name      : String
    genres    : Array
    avatar    : String
    followers : Number
    visitors  : Number
    sets      : Number
    about     : String

  stats:
    listeners: Number
    favorited: Number
    visitors : Number
  
  data:
    created_at: Date
    email:

    facebook: fb_info # facebook information

    images:
      profile: 
        id : # id used to upload picture, ie: fb:#{graph_id} | gp:#{gp_id}
        cdn: # cloudinary information


module.exports = mongoose.model 'User', schema