module.exports = ( dom ) ->

  # TODO: make it smart, subscribed when needed, unsuscribe when leaving
  # the room, etcs
  room_id = location.pathname.split( "/" )[2] 

  channel = pusher.subscribe room_id

  chat = $ '.chat_content'

  channel.bind 'chat_message', ( data ) ->

    if dom.find( '.no-message' ).length
      dom.find( '.no-message' ).remove()

    dom.append "<div><img src='#{data.avatar}' width='30' height='30'>#{data.message}</div>"

    console.log 'dom.scrollTop ->', dom.scrollTop
    console.log 'dom[0].scrollHeight ->', dom[0].scrollHeight


    chat.scrollTop( chat[0].scrollHeight )

    console.log "got data!!!", data