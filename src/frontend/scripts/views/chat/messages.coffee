module.exports = ( dom ) ->

  # TODO: make it smart, subscribed when needed, unsuscribe when leaving
  # the room, etcs
  room_id = location.pathname.split( "/" )[2] 

  channel = pusher.subscribe room_id

  channel.bind 'chat_message', ( data ) ->

    if dom.find( '.no-message' ).length
      dom.find( '.no-message' ).remove()

    dom.append "<div><img src='#{data.avatar}'>#{}{data.message}</div>"

    console.log "got data!!!", data

  console.log "pusher ->", pusher