globals = require './globals'

kue = require 'kue'

if s.is_beta
  prefix = 'b' # beta queue, the "production" one
else
  prefix = 's' # staging queue

jobs = kue.createQueue
  prefix: 'q'
  redis:
    port: s.redis.port
    host: s.redis.host,
    auth: s.redis.password
    db  : s.redis.kue_db

# queue UI will be http://localhost:1101
kue.app.listen process.env.PORT || 1101
kue.app.set 'title', "loopcast's tape recorder queue"

jobs.process 'tape:start', ( job, done ) ->
  console.log 'processing a job'

  # 0, 4 is RECEIVED
  # 1, 4 is RECORDING
  # 2, 4 is UPLOADING
  # 4, 4 is COMPLETED

  recording = -> 
    console.log 1
    job.progress 1, 4

  setTimeout recording, 5000

  uploading = -> 
    console.log 2
    job.progress 2, 4

  setTimeout uploading, 10000

  end = ->
    console.log 'end'
    done()

  setTimeout end, 15000

START_PRIORITY = 'high'
STOP_PRIORITY  = 'normal'

module.exports = api =

  tape:
    start: ( user = 'ghost', source = 'hems', callback ) ->

      console.log " - kue: start recording source : #{source}"

      job = jobs.create "tape:start",
        title     : "RECORDING mount point: #{source} for user: #{user}"
        source    : source
        # created_at: now().toDate()
        user      : user

      job.priority START_PRIORITY

      job.on 'complete', ->
        console.log "job completed -> #{job.id}"

      job.on 'failed', ->
        console.log "job failed -> #{job.id}"

      job.save ( error ) ->
        if error then return callback? error

        console.log "job tape:start #{job.id} is created!"
        
        # job meta data
        # console.log job.data

        callback? null, job


      return
      # TODO: create a delayed job to stop recording after the maximun limit
      # we allow the user
      job = jobs.create( "tape:stop",
        source    : source
        # created_at: now().toDate()
        user      : user
      ).priority( START_PRIORITY ).save ( error ) ->
        if error then return callback? error

        console.log "job tape:stop #{job.id} ( time limit abort ) is created!"
        
        # job meta data
        # console.log job.data

        callback? null, job

    stop : ( source ) ->

      console.log " - kue: stop recording source : #{source}"
