mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  info :
    id        : String # ie: thomas-amundsen
    name      : String
    genres    : Array
    avatar    : String
    followers : Number
    visitors  : Number
    sets      : Number
    about     : String

  # data:
  #   email:

  #   facebook:
  #     id      :
  #     email   :
  #     timezone:

  #   images:
  #     profile: 
  #       id : # id used to upload picture, ie: fb:#{graph_id} | gp:#{gp_id}
  #       cdn: # cloudinary information


module.exports = mongoose.model 'User', schema