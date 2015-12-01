api       = require 'api/loopcast/loopcast'
_         = require 'lodash'


module.exports = class ConfirmUsername
  constructor: () ->

    @input = $('.username')
    $btn   = $('#complete')

    @submitting = false

    # Submit changed name on click
    $btn.click (e) =>

      e.preventDefault()

      @submitting = true
      @checkUsername(e)

    # Check username while typing
    @input.on 'keyup', _.debounce( @checkUsername, 300 )


  checkUsername: (event) =>
    username = @input.val()

    # don't try in case it's empty
    if username.length is 0

      # remove error in case it's empty
      $('.error-box').removeClass('error')

      return

    # if user try to complete the form with the username
    # which was already randomly assigned, let it happen!
    if username is window.user.username
      window.complete_login()

      return

    api.user.is_available username, (error, response) =>

      # Submit on enter
      if event.keyCode is 13
        @submitting = true
      
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