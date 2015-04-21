user = require 'app/controllers/user'

module.exports = (dom) ->
  links = dom.data 'links'
  l = user.string_to_social_data links

  tmpl = require 'templates/components/editables/social_link_read_mode'
  html = ""
  for item in l
    html += tmpl( item )

  dom.append html
  
