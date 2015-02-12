mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  info :
    id        : String # ie: thomas-amundsen
    name      : String
    genres    : Array
    avatar    : Object
    # url : String
    # cdn : Object # cdn information regarding the image
    followers : Number
    visitors  : Number
    sets      : Number
    about     : String


module.exports = mongoose.model 'User', schema