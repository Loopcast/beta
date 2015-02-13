mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  # foreign key
  user_id: Schema.Types.ObjectId

  info   :
    id       : String # unique id fo the room? ie: title.safe() ?
    title    : String
    genres   : Array
    location : String
    about    : String
    cover    : String

  data :
    created_at: Date
    
    images:
      cover: 
        id : # id used to upload picture, ie: md5 of the file content
        cdn: # cloudinary information

module.exports = mongoose.model 'Room', schema