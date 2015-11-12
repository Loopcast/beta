api       = require 'api/loopcast/loopcast'
_         = require 'lodash'


module.exports = class ConfirmUsername
  constructor: () ->

    @input = $('.username')
    $btn = $('#complete')
    @submitting = false

    # Submit changed name on click
    $btn.click (e) =>
      e.preventDefault()
      @submitting = true
      @checkUsername()

    # Check username while typing
    @input.on 'keyup', _.debounce( @checkUsername, 300 )


  checkUsername: () =>
    username = @input.val()

    api.user.is_available username, (a, response) =>
      
      if not response.available
        # username taken, show error
        $('.error-box').addClass('error')

      else
        $('.error-box').removeClass('error')
        # Submit here if requested
        @submit(username)

      @submitting = false


  
  submit: (username) =>
    if @submitting

      api.user.is_available username, (a, response) ->
        
        if response.available
          api.user.edit_username username, window.close
