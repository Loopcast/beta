DEFAULT = require './default_images'

Transform = 
  all: ( url ) ->
    return {
      top_bar: Transform.top_bar url
      avatar: Transform.avatar url
      chat_thumb: Transform.chat_thumb url
      chat_sidebar: Transform.chat_sidebar url
      chat_sidebar_popup: Transform.chat_sidebar_popup url
      explore_thumb: Transform.explore_thumb url
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
      return DEFAULT.cover
    else
      url.replace "upload/", "upload/w_1140,h_350,c_fill,g_north/"

  cover_thumb: ( url ) ->
    if not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_thumb
    else
      url.replace "upload/", "upload/w_200,h_167,c_fill,g_north/"    

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

  explore_thumb: ( url, is_room = false ) -> 
    if not url? or url.indexOf( "upload/" ) < 0
      if is_room
        return "/images/default_room_thumb.jpg"
      else
        return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_210,h_210,c_fill,g_north/"

  

module.exports = Transform