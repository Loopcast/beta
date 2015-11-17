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

    # don't try in case it's empty
    if username.length is 0

      # remove error in case i't empty
      $('.error-box').removeClass('error')

      return

    api.user.is_available username, (error, response) =>
      
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

      api.user.is_available username, (error, response) ->
        
        if error
          console.error "username not available"

          # needs UI feedback

          return

        if response.available

          api.user.edit_username username, (error, response) ->

            if error
              console.error "error updating username"

              # needs UI feedback

              return

            window.user.username = username
            window.complete_login()
            # close the window if everything is fine
            # window.close()