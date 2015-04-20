module.exports = 
  top_bar: ( url ) -> 
    if url.indexOf( "upload/" ) < 0
      return "/images/profile-49.jpg"
    else
      url.replace "upload/", "upload/w_49,h_49,c_fill,g_north/"

  avatar: ( url ) -> 
    if url.indexOf( "upload/" ) < 0
      return "/images/profile-150.jpg"
    else
      url.replace "upload/", "upload/w_150,h_150,c_fill,g_north/"

  cover: ( url ) -> 
    if url.indexOf( "upload/" ) < 0
      return "/images/profile-150.jpg"
    else
      url.replace "upload/", "upload/w_1000,h_400,c_fill,g_north/"
