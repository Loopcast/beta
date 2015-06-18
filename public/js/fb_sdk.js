function fb_init( app_id ){
  window.fbAsyncInit = function() {
    FB.init({
      appId      : app_id,
      xfbml      : true,
      version    : 'v2.3'
    });
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