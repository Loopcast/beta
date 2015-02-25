mongoose = require( 'mongoose')
Schema   = mongoose.Schema

schema = new Schema
  # foreign key
  user_id: Schema.Types.ObjectId

  info   :
    slug     : String # unique id fo the room? ie: title.safe() ?
    title    : type: String, required: true
    genres   : Array
    location : String
    about    : String
    cover    : String

  images:
    cover: Object # cloudinary information
      

#
# hooks
#

slug         = require 'slug'
delete_image = lib 'cloudinary/delete'

schema.post 'validate', ( doc ) ->

  # slugify the title of the room
  doc.info.slug = slug doc.info.title

  console.info "Created slug #{doc.info.slug} for room #{doc.info.title}"

  # gets secure url
  if doc.images.cover
    doc.info.cover = doc.images.cover.secure_url

    console.info "Saving cover #{doc.info.cover}"


schema.post 'remove', ( doc ) ->
  # TODO: delete cloudinary image

  console.warn " Deleting room -> " + doc._id

  if doc.images?.cover?.cdn?
    delete_image doc.images.cover.cdn.public_id

module.exports = mongoose.model 'Room', schema