module.exports = 

  method : 'GET'
  path   : '/favicon.ico'

  handler: file: www '/favicon.ico'

  config: 
    cache:
  #     mode: 'client'
      expiresIn: 86400000
      privacy: 'public'