cloudinary = require 'cloudinary'

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


cloudinary_config = 
  

s.cloudinary = cloudinary.config =
  cloud_name      : 'loopcast', 
  api_key         : '631677181392992', 
  api_secret      : 'opQ179HoyQlceRzNr1VGMukScas',
  api_unsigned_ids: 
    cover  : 'loopcast_cover_image'
    profile: 'loopcast_profile_image'

s.facebook =
  app:
    id           : "1551393601809115"
    secret       : "7d4307b592fb8aab287582835bdba803"
  graph:
    url: 'https://graph.facebook.com/v2.2/'
  pool : maxSockets: Infinity

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

s.mailchimp =
  key: "266e1e3b7b198e6d32fb1939fc230110"
  id : "7d55764424"

  url: "https://us3.api.mailchimp.com/2.0/lists/subscribe.json"

# IF PRODUCTION
if s.is_beta

  # ~ databases

  s.mongo =
    url: "mongodb://loopy:ulpi1991@ds029060-a0.mongolab.com:29060,ds029060-a1.mongolab.com:29060/loopdb"
    options: 
      user: 'myUserName',
      pass: 'myPassword'

  s.redis =
    host     : 'pub-redis-17738.eu-west-1-1.2.ec2.garantiadata.com'
    port     : 17738
    password : '9b83PvcXCgqJPspO'

  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

# IF LOCAL OR DEVELOPMENT
else

  # ~ databases

  s.mongo =
    url: "mongodb://loopy:ulpi1991@ds029060-a0.mongolab.com:29060,ds029060-a1.mongolab.com:29060/loopdb"
    options: 
      user: 'myUserName',
      pass: 'myPassword'

  s.redis =
    host     : 'pub-redis-17738.eu-west-1-1.2.ec2.garantiadata.com'
    port     : 17738
    password : '9b83PvcXCgqJPspO'

  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"


module.exports = s