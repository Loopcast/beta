module.exports = 
  get_room_subscribe_id: ( owner_id, room_id ) ->
    str = "#{owner_id}.#{room_id}"
    console.log "Pusher utils", room_id, owner_id, str
    return str