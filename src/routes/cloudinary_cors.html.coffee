module.exports = 

  method : 'GET'
  path   : "/cloudinary_cors.html"

  handler: 
    file : www "/cloudinary_cors.html"

  config: 
    cache:
  #     mode: 'client'
      expiresIn: 86400000
      privacy: 'public'