module.exports = (dom) ->
  counter = null
  

  _init = ->
    counter = dom.find '.session_text'
    app.on 'room:deleted', _check_rooms

  _check_rooms = ->
    sets_left = dom.find( '.recorded_sessions .session.outline_box' ).length
    log "[Sets] _check_rooms", sets_left

    counter.html sets_left

    if sets_left <= 0
      dom.addClass 'no_recorded_sessions'
      if dom.find( '.session.outline_box' ).length <= 0
        dom.addClass 'no_sessions'


  _init()