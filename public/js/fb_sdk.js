function fb_init( app_id ){
  window.fbAsyncInit = function() {
    FB.init({
      appId      : app_id,
      // music      : true, // install facebook music bridge on the page
      xfbml      : true,
      version    : 'v2.4'
    });

    // fb_parse();

    window.fb_ready = true;
    if($){
      console.log( "[Facebook] triggering" );
      $(window).trigger( 'fb:ready' );
    } else {
      console.log( "[Facebook] jQuery non defined" );
    }
    // // PLAY means start playing a new track, the song URL is passed in
    // FB.Event.subscribe('fb.music.PLAY', function(){
    //   console.group( "fb.music.PLAY" )

    //   console.debug( arguments );

    //   console.groupEnd( "fb.music.PLAY" )
    // });
    // // RESUME means the user hit play on the paused track
    // FB.Event.subscribe('fb.music.RESUME', function(){
    //   console.group( "fb.music.RESUME" )

    //   console.debug( arguments );

    //   console.groupEnd( "fb.music.RESUME" )
    // });
    // // The user hit pause on the currently playing track
    // FB.Event.subscribe('fb.music.PAUSE', function(){
    //   console.group( "fb.music.PAUSE" )

    //   console.debug( arguments );

    //   console.groupEnd( "fb.music.PAUSE" )
    // });
    // // Facebook is polling for status, send a status message to Facebook so it can display the current song
    // FB.Event.subscribe('fb.music.STATUS', 
    //   function(params) {
    //     // FB.Music.send('STATUS', {playing: true, song: url }

    //       console.group( "fb.music.STATUS" )

    //       console.debug( arguments );

    //       console.groupEnd( "fb.music.STATUS" )
    //   }
    // );

  };  
} 


(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));


function fb_share() {
  FB.ui({
    method: 'feed',
    link: 'https://developers.facebook.com/docs/',
    caption: 'An example caption',
    description: "The description",
    picture: "https://www.google.it/logos/doodles/2015/republic-day-italy-2015-5148358477873152-hp.jpg"
  }, function(response){
    console.log( response );
  });
}

function fb_parse() {
  console.log( '[Facebook] fb_parse()' )
  FB.XFBML.parse()
}