var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-3515894-2']);
_gaq.push(['_trackPageview']);

Analytics = {
  load: function() {
    setTimeout(function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName("head")[0].appendChild(ga);
    }, 500);
  }
};
