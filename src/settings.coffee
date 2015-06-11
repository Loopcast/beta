s =
  # beta is our "production"
  is_beta        : process.env.NODE_ENV is 'beta'
  port           : process.env.PORT || 1993
  is_dev_machine : require("os").hostname().indexOf( 'local' ) != -1
  debug          : off
  in_production  : process.env.NODE_ENV is 'production'
  https          : off
  server:
    url: 'http://beta.loopcast.fm'

###
#  when running locally s.base_path will be overwritten by "server.coffee"
#  which will set it to be the address of the running machine
###
if s.is_beta
  s.base_path = "http://beta.loopcast.fm"
else
  s.base_path = "http://staging.loopcast.fm"

s.cloudinary =
  cloud_name      : 'loopcast', 
  api_key         : '631677181392992', 
  api_secret      : 'opQ179HoyQlceRzNr1VGMukScas',
  api_unsigned_ids: 
    cover  : 'loopcast_cover_image'
    profile: 'loopcast_profile_image'


facebook_apps_id =
  local: "1607669199514888"
  stage: "1608982952716846"
  live: "1551393601809115"

s.facebook =
  app:
    id           : facebook_apps_id.live
    secret       : "7d4307b592fb8aab287582835bdba803"
  graph:
    url: 'https://graph.facebook.com/v2.2/'
  pool : maxSockets: Infinity

switch process.env.NODE_ENV
  when 'local'
    s.facebook.client_sdk_id = facebook_apps_id.local
  when 'beta'
    s.facebook.client_sdk_id = facebook_apps_id.stage
  else
    s.facebook.client_sdk_id = facebook_apps_id.live


  



s.soundcloud =
  id           : "afac925318ccc98d6aca4631b0a86a92"
  secret       : "be900f4e96a1d18da740c6536cc756ee"

s.twitter =
  id           : "3YqpmaF3kZjd6vH7ijnSZg"
  secret       : "w9PMdVtjN496Op1B4Obk6dkg48MPixYil2gy6mBW0Kk"

s.google =
  id              : '957006099085-8a3950umkka7sklpg09ncvt794uoeped.apps.googleusercontent.com',
  secret          : 'zPC2aBhCnCELhSKFKOlqbH58',
  provider_params : 
    redirect_uri: s.server.url + '/login/google'

s.cache =
  chat:
    messages:
      length: 25
      timeout: 7 * 24 * 60 * 60

s.mailchimp =
  key: "266e1e3b7b198e6d32fb1939fc230110"
  id : "7d55764424"

  url: "https://us3.api.mailchimp.com/2.0/lists/subscribe.json"

# IF PRODUCTION
if s.is_beta

  # ~ databases

  s.mongo =
    url: "mongodb://l00pc4st:l00pc4st2015@c456.lamppost.2.mongolayer.com:10456,c499.lamppost.7.mongolayer.com:10499/beta?replicaSet=set-54e241573646b81682000bbf"
    options: 
      user: 'l00pc4st',
      pass: 'l00pc4st2015'

  s.redis =
    host     : 'pub-redis-11676.eu-west-1-1.1.ec2.garantiadata.com'
    port     : 11676
    password : 'loopcast2015'
    kue_db   : 0

  # TODO: create beta bucket
  s.s3 =
    bucket: 'rekorded-beta'
    key   : "AKIAJEYWTAUA3QWZGTOA"
    secret: "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"

  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "50c73c97d2be733425b373a6bd9e26c595390e44"
    id : "uk6rn1dt"

  s.pusher = 
    appId: '115738',
    key: '23e67be659fc6663206d',
    secret: 'b324ac27d8ec6f3f589a'

  s.tape = 'http://tape.loopcast.fm:8000'

  s.radio = 'http://radio.loopcast.fm:8000'

# IF LOCAL OR DEVELOPMENT
else

  # ~ databases

  s.mongo =
    url: "mongodb://l00pc4st:l00pc4st2015@c456.lamppost.2.mongolayer.com:10456,c499.lamppost.7.mongolayer.com:10499/beta?replicaSet=set-54e241573646b81682000bbf"
    options: 
      user: 'l00pc4st',
      pass: 'l00pc4st2015'

  s.redis =
    host     : 'pub-redis-10651.us-east-1-1.2.ec2.garantiadata.com'
    port     : 10651
    password : 'loopcast2015'
    kue_db   : 0

  s.s3 =
    bucket: 'rekorded'
    key   : "AKIAJEYWTAUA3QWZGTOA"
    secret: "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"
    
  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "0ccd5941f4f1658d00ca02e8c0cea5dca7a1e01d"
    id : "e8diaexy"

  s.pusher = 
    appId: '115735',
    key: 'e269699ecff3c224a612',
    secret: '5a05943c7bf757cdd315'

  s.tape = 'http://tape.loopcast.fm:8000'

  s.radio = 'http://radio.loopcast.fm:8000'


module.exports = s
