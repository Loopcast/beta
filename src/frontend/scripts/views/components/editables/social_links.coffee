happens = require 'happens'
user_controller = require 'app/controllers/user'
Url = require 'app/utils/url_parser'

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
      @data = user_controller.string_to_social_data data

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
      if Url.is_url item.value
        data = user_controller.get_social_info_from_url item.value
        @data.push data

    @build_read_mode_from_data()
        

  build_read_mode_from_data: ->
    log "build_read_mode_from_data", @data
    html = ""
    for item in @data
      html += @read_template( item )
    @dom_read_mode.html html

  build_write_mode_from_data: ->
    html = @write_template links: @data
    @dom.html html


  get_current_value: ->
    return user_controller.social_data_to_string( @data )

  add_new: =>
    @new_link_btn.before @template_input.clone()
    return false


  get_template: ( callback ) ->

    tmpl = require 'templates/components/editables/social_links'
    
    callback tmpl()


  destroy: ->
    @new_link_btn.off 'click', @add_new




  

