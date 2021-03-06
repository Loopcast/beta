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

  all_cover: (url) ->
    return {
      explore_thumb: Transform.explore_thumb url
      cover        : Transform.cover url
    }

  top_bar: ( url ) -> 

    if not url or not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-49.jpg"
    else
      url.replace "upload/", "upload/w_28,h_28,c_fill/"

  avatar: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.avatar
    else
      url.replace "upload/", "upload/w_150,h_150,c_fill/"

  cover: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover
    else
      url.replace "upload/", "upload/w_1140,h_350,c_fill/"

  og_image: ( url ) -> 
    # if not URL or not cloudinary URL
    # return empty
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return ""
    else
      url.replace "upload/", "upload/w_1200,h_630,c_fill/"

  cover_mobile: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_mobile
    else
      url.replace "upload/", "upload/w_400,h_184,c_fill/"

  cover_thumb: ( url, avatar = DEFAULT.avatar ) ->
    if not url or not url? or url.indexOf( "upload/" ) < 0
      url = avatar
      
    url.replace "upload/", "upload/w_200,h_167,c_fill,g_center/"    

  

  chat_thumb: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_36,h_36,c_fill/"

  chat_sidebar: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_55,h_55,c_fill/"

  chat_sidebar_popup: ( url ) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return "/images/profile-36.jpg"
    else
      url.replace "upload/", "upload/w_84,h_84,c_fill/"

  explore_thumb: ( url) -> 
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_thumb
    else
      url.replace "upload/", "upload/w_210,h_210,c_fill/"

  explore_thumb_mobile: ( url ) ->
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_thumb_mobile
    else
      url.replace "upload/", "upload/w_370,h_186,c_fill/"    

  player_thumb: ( url ) ->
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_thumb_player
    else
      url.replace "upload/", "upload/w_70,h_70,c_fill/"

  upload_mix_cover: ( url ) ->
    if not url or not url? or url.indexOf( "upload/" ) < 0
      return DEFAULT.cover_uploaded_mix
    else
      url.replace "upload/", "upload/w_290,h_290,c_fill/"
  

module.exports = Transform