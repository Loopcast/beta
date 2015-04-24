module.exports = ( cloudinary_url ) ->
  id = cloudinary_url.match /(\w+)(\.\w+)+(?!.*(\w+)(\.\w+)+)/
  id = id[1]