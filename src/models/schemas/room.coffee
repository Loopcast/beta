mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  # url is automatically generated #{owner_user}/#{info.slug}
  url    : type: String, required: true, unique: true
  info   :
    owner_user: type: String, required: true
    title     : type: String, required: true
    # slug automatically generated using npm's slug module
    slug      : type: String, required: true # unique id fo the room? ie: title.safe() ?
    genres    : Array
    location  : String
    about     : String
    cover     : String

  images:
    cover: Object # cloudinary information
      

#
# hooks
#

delete_image = lib 'cloudinary/delete'

schema.post 'remove', ( doc ) ->
  # TODO: delete cloudinary image

  console.warn " Deleting room -> " + doc._id

  if doc.images?.cover?.cdn?
    delete_image doc.images.cover.cdn.public_id

schema.pre 'save', ( next ) ->

  console.log "pre save two"

  @created_at = @updated_at = now()

  next()

module.exports = mongoose.model 'Room', schema