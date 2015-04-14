mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  # url is automatically generated #{user}/#{info.slug}
  info   :
    user     : type: String, required: on
    title    : type: String, required: on
    slug     : type: String, required: on
    genres   : Array
    location : String
    about    : String
    cover    : String

  status:
    is_live     : { type: Boolean, default: off }
    is_recording: { type: Boolean, default: off }
    is_public   : { type: Boolean, default: off }
    streaming:
      started_at  : Date
      stopped_at  : Date
    recording:
      started_at  : Date
      stopped_at  : Date

  images:
    cover: Object # cloudinary information

  updated_at: Date
  created_at: Date

schema.statics.findAndModify = (query, sort, doc, options, callback) ->
  @collection.findAndModify query, sort, doc, options, callback

Room = mongoose.model 'Room', schema

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

  if not @created_at
    @created_at = now().format()

  @updated_at = now().format()

  next()

schema.pre 'save', ( next, done ) ->

  # TODO: if finds another room with same URL
  # check what is the status.
  # If it's a room that never went live and it's empty
  # we can simply delete or return that entry instead
  
  doc = @

  query = 
    'info.user'

  Room.find( { }, _id: off )
    .where( "url"  , "#{@info.user}/#{@info.slug}" )
    .where( "status.is_live", true )
    .select( "url" )
    .lean()
    .exec ( error, room ) -> 
      if error then failed null, null, error

      if room.length
        console.log " ! Found another room live with same id ->", room

        doc.invalidate 'url', 'you cant have two live rooms with same url'
        return done new Error('cant_have_two_live_rooms_with_same_url')

      next()

module.exports = Room