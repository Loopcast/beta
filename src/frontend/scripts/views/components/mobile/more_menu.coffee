user_controller = require 'app/controllers/user'

module.exports = (dom) ->
  user_controller.on 'user:logged', ->
    dom.find( '.profile_link' )
      .attr( 'href', '/' + user_controller.data.username )
      .attr( 'title', user_controller.data.name )

  