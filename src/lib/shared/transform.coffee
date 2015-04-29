Transform = 
  all: ( url ) ->
    return {
      top_bar: Transform.top_bar url
      avatar: Transform.avatar url
      chat_thumb: Transform.chat_thumb url
      chat_sidebar: Transform.chat_sidebar url
      chat_sidebar_popup: Transform.chat_sidebar_popup url
    }

  top_bar: ( url ) -> 

    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-49.jpg"
    else
      url.replace "upload/", "upload/w_28,h_28,c_fill,g_north/"

  avatar: ( url ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-150.jpg"
    else
      url.replace "upload/", "upload/w_150,h_150,c_fill,g_north/"

  cover: ( url ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-150.jpg"
    else
      url.replace "upload/", "upload/w_1000,h_400,c_fill,g_north/"

  chat_thumb: ( url ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_36,h_36,c_fill,g_north/"

  chat_sidebar: ( url ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_55,h_55,c_fill,g_north/"

  chat_sidebar_popup: ( url ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_84,h_84,c_fill,g_north/"

  

module.exports = Transform