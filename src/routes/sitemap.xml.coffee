module.exports = 

  method : 'GET'
  path   : '/sitemap.xml'

  handler: file: www '/sitemap.xml'

  config: 
    cache:
  #     mode: 'client'
      expiresIn: 86400000
      privacy: 'public'