mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  info   :
    id        : String # ie: thomas-amundsen
    name      : String
    genres    : Array
    image     : String
    followers : Number
    visitors  : Number
    sets      : Number
    info      : String


module.exports = mongoose.model 'User', schema