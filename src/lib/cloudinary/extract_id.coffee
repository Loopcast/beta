module.exports = ( cloudinary_url ) ->
  id = cloudinary_ur.match /(\w+)(\.\w+)+(?!.*(\w+)(\.\w+)+)/
  id = id[1]