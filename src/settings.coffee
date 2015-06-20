url = require('url')

s =
  # beta is our "production"
  is_beta        : process.env.NODE_ENV is 'production'
  is_local       : process.env.NODE_ENV is 'local'
  port           : process.env.PORT || 1993
  debug          : off
  https          : off

if s.is_beta
  s.base_path = "http://beta.loopcast.fm"
else
  s.base_path = "http://staging.loopcast.fm"

if s.is_local
  s.base_path = "http://localhost:1993"

s.cache =
  chat:
    messages:
      length: 25
      timeout: 7 * 24 * 60 * 60


s.cloudinary =
  api_unsigned_ids: 
    cover  : 'loopcast_cover_image'
    profile: 'loopcast_profile_image'


s.google =
  id              : '957006099085-8a3950umkka7sklpg09ncvt794uoeped.apps.googleusercontent.com',
  secret          : 'zPC2aBhCnCELhSKFKOlqbH58',
  provider_params : 
    redirect_uri: s.is_beta + '/login/google'

s.facebook =
  app:
    id           : "1551393601809115"
    secret       : "7d4307b592fb8aab287582835bdba803"
  graph:
    url: 'https://graph.facebook.com/v2.2/'

s.soundcloud =
  id           : "afac925318ccc98d6aca4631b0a86a92"
  secret       : "be900f4e96a1d18da740c6536cc756ee"




# PRODUCTION / STAGING reading from environment variables
if not s.is_local

  s.mongo = url: process.env.MONGOHQ_URL

  r_info  = url.parse process.env.REDISCLOUD_URL
  s.redis = 
    host     : r_info.hostname
    port     : r_info.port
    password : r_info.auth.split(":")[1]
    kue_db   : 0

# IF PRODUCTION
if s.is_beta

  s.facebook.client_sdk_id = "1551393601809115"

  s.cloudinary.cloud_name = 'htfhoylhb'
  s.cloudinary.api_key    = '391232997283122'
  s.cloudinary.api_secret = 'NLOD5i_vCGIE2RW_WcAjEU2GsoA'

  s.s3 =
    bucket: 'rekorded-beta'
    key   : "AKIAJEYWTAUA3QWZGTOA"
    secret: "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"

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "50c73c97d2be733425b373a6bd9e26c595390e44"
    id : "uk6rn1dt"

  s.pusher = 
    appId : '115738'
    key   : '23e67be659fc6663206d'
    secret: 'b324ac27d8ec6f3f589a'

  s.tape = 'http://tape.loopcast.fm:8000'

  s.radio = 'http://radio.loopcast.fm:8000'

# IF STAGING OR LOCAL
if not s.is_beta

  s.facebook.client_sdk_id = "1608982952716846"

  s.cloudinary.cloud_name = 'hrrdqnsfe'
  s.cloudinary.api_key    = '273849796775415'
  s.cloudinary.api_secret = 'ntUSkY1IAi4si79ZXjt22WCO6u8'

  s.s3 =
    bucket: 'rekorded'
    key   : "AKIAJEYWTAUA3QWZGTOA"
    secret: "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"

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "0ccd5941f4f1658d00ca02e8c0cea5dca7a1e01d"
    id : "e8diaexy"

  s.pusher = 
    appId : '115735',
    key   : 'e269699ecff3c224a612',
    secret: '5a05943c7bf757cdd315'

  s.tape = 'http://staging-tape.loopcast.fm:8000'

  s.radio = 'http://staging-radio.loopcast.fm:8000'

# IF LOCAL
if s.is_local

  s.facebook.client_sdk_id   = "1607669199514888"

  # ~ databases

  s.mongo =
    url: "mongodb://local_login:local_login22@ds027491.mongolab.com:27491/heroku_cxd8vp30"
    options: 
      user: 'l00pc4st',
      pass: 'l00pc4st2015'

  s.redis =
    host     : 'pub-redis-17159.eu-west-1-2.1.ec2.garantiadata.com'
    port     : 17159
    password : 'N3eP40AZT7ztktho'
    kue_db   : 0


module.exports = s
