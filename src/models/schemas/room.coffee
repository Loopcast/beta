mongoose   = require( 'mongoose')
Schema     = mongoose.Schema

schema = new Schema
  # _id of the user owning the room
  user   : type: Schema.Types.ObjectId, ref: 'User', required: on

  info   :
    # actually this is the username, we must rename to username
    # and update every time the user updates it's own info
    # using this for search purposes at the moment
    user      : type: String, required: on
    title     : type: String, required: on
    slug      : type: String, required: on
    genres    : { type: Array, default: [] }
    location  : String
    about     : String
    cover_url : String

    # should save server URL and stream URL separetely, so we can update it
    # easier later?
    url       : String # url of the stream
    file      : String # url of the recorded file

  likes       : { type: Number, default: 0 }
  visits      : { type: Number, default: 0 }

  in_chat     : { type: Array, default: [] }

  # password for starting this stream
  password   : String
  
  status:
    is_live      : { type: Boolean, default: off } # when user press go live
    is_recording : { type: Boolean, default: off } # when user press start recording
    is_public    : { type: Boolean, default: off } # while user is live or after publishing a set
    is_recorded  : { type: Boolean } # while user is live or after publishing a set
    dropped      : { type: Boolean } # true if disconnects without clicking STOP
    # is_streaming : { type: Boolean, default: off } # when appcast is connected to the server ?
    live:
      listeners    : { type: Number, default: 0 }
      duration    : Number
      started_at  : Date
      stopped_at  : Date
    recording:
      plays       : { type: Number, default: 0 }
      duration    : Number
      started_at  : Date
      stopped_at  : Date
      s3          : Object

  # id of the current streaming document
  stream    : type: Schema.Types.ObjectId, ref: 'Stream'

  # TODO: rename to tape instead of recording
  recording : type: Schema.Types.ObjectId, ref: 'Tape'

  updated_at: Date
  created_at: Date

schema.statics.findAndModify = (query, sort, doc, options, callback) ->
  # automatically transform string to ObjectId
  if query._id
    query._id  = mongoose.Types.ObjectId query._id

  if query.user
    query.user = mongoose.Types.ObjectId query.user

  @collection.findAndModify query, sort, doc, options, callback

Room = mongoose.model 'Room', schema

text_indexes = 
  'info.user'    : 'text'
  'info.title'   : 'text'
  'info.genres'  : 'text'
  'info.location': 'text'
  'info.about'   : 'text'

mongoose.connection.collections['rooms'].ensureIndex text_indexes, ( error ) ->

  if error
    console.error "error indexing fields for text search"
    console.error error
    return 

#
# hooks
#


schema.post 'remove', ( doc ) ->
  # TODO: delete cloudinary image

  console.warn "Room Schema Hook post removing room_id: " + doc._id

schema.pre 'save', ( next ) ->

  @updated_at = now().format()

  next()

schema.pre 'save', ( next, done ) ->

  # TODO: if finds another room with same URL refuses to save, otherwise
  # we would have two sessions with the name address
  
  doc = @

  query = 
    user       : @user
    'info.slug': @info.slug

  Room.find( query, _id: off )
    # can't have same slug twice
    # .where( "status.is_live", true )
    .select( "url" )
    .lean()
    .exec ( error, room ) -> 
      if error then failed null, null, error

      if room.length
        console.log " ! Found another room with same slug ->", room

        doc.invalidate 'url', 'cant have same slug on different sessions'
        return done new Error('cant_have_same_slug_twice')

      next()

module.exports = Room