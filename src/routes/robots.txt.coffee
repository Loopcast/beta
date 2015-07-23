module.exports = 

  method : 'GET'
  path   : '/robots.txt'

  handler: file: www '/robots.txt'

  config: 
    cache:
  #     mode: 'client'
      expiresIn: 86400000
      privacy: 'public'