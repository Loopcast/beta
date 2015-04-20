happens = require 'happens'
module.exports = class SocialLinks

  default_state : on
  default_text: ""

  data: []
  template_input: null
  read_template: ""
  constructor: ( @dom ) ->
    happens @

    @dom.addClass 'social_links'

    @dom_read_mode = $ '.social_read_mode'

    @dom.on 'click', (e) -> e.stopPropagation()

    @read_template = require 'templates/components/editables/social_link_read_mode'
    @write_template = require 'templates/components/editables/social_links'

    data = @dom.data 'links'

    if data.length > 0
      @data = @string_to_social_data data

    @build_write_mode_from_data()
    # TEMP
    @build_read_mode_from_data()



    @new_link_btn = @dom.find '.add_new_link'
    @template_input = @dom.find( 'input' ).clone().val( '' )

    @new_link_btn.on 'click', @add_new

  close_read_mode: ->
    links = @dom.find 'input'
    @data = []
    # Update the read mode
    for item in links
      if @is_url item.value
        data = @get_social_info_from_url item.value
        @data.push data

    @build_read_mode_from_data()
        

  string_to_social_data: ( data ) ->
    data = data.split ','
    output = []
    for item in data
      output.push @get_social_info_from_url( item )

    return output


  social_data_to_string: ( data ) ->
    output = []
    for item in data
      output.push item.value

    return output.join ','

  build_read_mode_from_data: ->
    html = ""
    for item in @data
      html += @read_template( item )
    @dom_read_mode.html html

  build_write_mode_from_data: ->
    html = @write_template links: @data
    @dom.html html


  get_social_info_from_url: ( s ) ->

    # facebook, spotify, soundcloud
    if s.indexOf( 'facebook.com' ) > -1
      social = "facebook"
      title = "facebook"

    else if s.indexOf( 'spotify.com' ) > -1
      social = "spotify"
      title = "spotify"

    else if s.indexOf( 'soundcloud.com' ) > -1
      social = "soundcloud"
      title = "soundcloud"

    else
      social = "generic"
      title = "user link"

    return {
      social: social
      title: title
      value: s
    }

  get_current_value: ->
    return @social_data_to_string( @data )

  is_url: ( s ) ->
    regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s)

  add_new: =>
    @new_link_btn.before @template_input.clone()


  get_template: ( callback ) ->

    tmpl = require 'templates/components/editables/social_links'
    
    callback tmpl()


  destroy: ->
    @new_link_btn.off 'click', @add_new




  

