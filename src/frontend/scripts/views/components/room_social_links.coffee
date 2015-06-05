user = require 'app/controllers/user'

module.exports = (dom) ->
  links = dom.data 'links'



  return if links.length <= 0

  l = user.string_to_social_data links

  log "links", links, l

  tmpl = require 'templates/components/editables/social_link_read_mode'
  html = ""
  for item in l
    html += tmpl( item )

  dom.append html
  
