module.exports = class Player
  constructor: ( @dom ) ->
    log "Player"

    @cover = @dom.find '.player_icon img'
    @title = @dom.find '.player_title'
    @author = @dom.find '.player_author'

    delay 2000, =>
      @open 
        cover: "/images/profile_big.png"
        title: "Live from Siracusa"
        author: "Stefano Ortisi"
        url: "http://google.com"

    view.once 'binded', @on_views_binded

  on_views_binded: =>
    @share = view.get_by_dom @dom.find( '.share_wrapper' )
    
  open: ( data ) ->
    if data?
      @cover.attr 'src', data.cover
      @title.html data.title
      @author.html data.author

      @share.update_link data.url

    @dom.addClass 'visible'

  close: ( ) ->
    @dom.removeClass 'visible'



