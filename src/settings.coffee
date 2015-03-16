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

###
#  when running locally s.base_path will be overwritten by "server.coffee"
#  which will set it to be the address of the running machine
###
if s.is_beta
  s.base_path = "http://beta.loopcast.fm"
else
  s.base_path = "http://development.loopcast.fm"

s.cloudinary =
  cloud_name      : 'loopcast', 
  api_key         : '631677181392992', 
  api_secret      : 'opQ179HoyQlceRzNr1VGMukScas',
  api_unsigned_ids: 
    cover  : 'loopcast_cover_image'
    profile: 'loopcast_profile_image'

cloudinary.config s.cloudinary


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
    url: "mongodb://l00pc4st:l00pc4st2015@c456.lamppost.2.mongolayer.com:10456,c499.lamppost.7.mongolayer.com:10499/beta?replicaSet=set-54e241573646b81682000bbf"
    options: 
      user: 'l00pc4st',
      pass: 'l00pc4st2015'

  s.redis =
    host     : 'pub-redis-11676.eu-west-1-1.1.ec2.garantiadata.com'
    port     : 11676
    password : 'loopcast2015'
    kue_db   : 0

  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "50c73c97d2be733425b373a6bd9e26c595390e44"
    id : "uk6rn1dt"

# IF LOCAL OR DEVELOPMENT
else

  # ~ databases

  s.mongo =
    url: "mongodb://l00pc4st:l00pc4st2015@dogen.mongohq.com:10071/loopcast-staging"
    options: 
      user: 'l00pc4st',
      pass: 'l00pc4st2015'

  s.redis =
    host     : 'pub-redis-11676.eu-west-1-1.1.ec2.garantiadata.com'
    port     : 11676
    password : 'loopcast2015'
    kue_db   : 0

  # ~ app session

  s.session =
    secret : "super-duper-secret-that-nobody-would-evah-guess-saxophone"
    key    : "loopcast.sid"

  s.intercom = 
    key: "0ccd5941f4f1658d00ca02e8c0cea5dca7a1e01d"
    id : "e8diaexy"


module.exports = s