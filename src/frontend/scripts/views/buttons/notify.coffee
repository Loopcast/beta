module.exports = (dom) ->

    dom.click ->

      console.log ' ->', dom.find( "input" ).attr ('checked')

      if dom.find( "input" ).attr ('checked')
        dom.find( "input" ).removeAttr 'checked'

      else

        console.log 'input ->', dom.find( "input" )

        dom.find( "input" ).attr 'checked', 'checked'
        dom.find( "input" )[0].checked = true