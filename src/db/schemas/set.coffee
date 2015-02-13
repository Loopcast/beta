mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  # foreign key 
  user_id: Schema.Types.ObjectId

  info   :
    url      : String # icecast url ?
    id       : String # unique id? ie: last-saturday-session
    title    : String
    genres   : Array
    location : String
    loves    : Number
    plays    : Number
    is_live  : Boolean


module.exports = mongoose.model 'Set', schema