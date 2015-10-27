module.exports = ( dom ) ->
  dom.on 'click', -> 
    FB.login (response) ->
      if (response.authResponse)
        log 'Welcome!  Fetching your information.... '
        FB.api '/me', (response) ->
          log 'Good to see you, ' + response.name + '.'

      else
        console.log('User cancelled login or did not fully authorize.');
    
    return false

