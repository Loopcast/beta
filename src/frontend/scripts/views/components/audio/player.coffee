module.exports = class Player
  constructor: ( @dom ) ->
    @cover  = @dom.find '.player_icon img'
    @title  = @dom.find '.player_title'
    @author = @dom.find '.player_author'
    @audio  = @dom.find 'audio'

    # delay 2000, =>
    #   @open 
    #     cover: "/images/profile_big.png"
    #     title: "Live from Siracusa"
    #     author: "Stefano Ortisi"
    #     url: "http://loopcast.com/stefanoortisi/live"
    #     author_link: "http://loopcast.com/stefanoortisi"

    view.once 'binded', @on_views_binded

  on_views_binded: (scope) =>
    @share = view.get_by_dom @dom.find( '.share_wrapper' )
    
  open: ( data ) ->
    if data?
      @cover.attr 'src', data.cover
      @title.html data.title
      @author.html "By " + data.author

      @author.attr 'title', data.title
      @title.attr 'title', data.author

      @author.attr 'href', data.author_link
      @title.attr 'href', data.url

      @cover.parent().attr 'href', data.url
      @cover.parent().attr 'title', data.title

      @share.update_link data.url

    @dom.addClass 'visible'

  close: ( ) ->
    @dom.removeClass 'visible'

  play: ( mountpoint ) ->
    @open()

    @audio.attr 'src', "http://radio.loopcast.fm:8000/#{mountpoint}"



