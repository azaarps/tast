var jsCommentPages = function(){
  var $activePage,
		$activeTab,
		init = function(){	
			$(".comments-tab").each(function(){
				var $tab = $(this);
				$tab.click(selectPage)
					.addClass("js-inactive-tab");
				switch ($tab.attr("id")){
					case "blogger-comments": 
						$tab.prepend("<'http://lh6.googleusercontent.com/-_InM8Yxvqlg/Tg03QmGCkDI/AAAAAAAAAd8/Ozlnv5wP_C8/s800/blogger-white-B.png'>");
						break;
					case "disqus-comments":
						$tab.prepend("<'http://4.bp.blogspot.com/-Vh58qAXwdcw/UcbkHl31HMI/AAAAAAAAEJ0/QndAwVtUZAI/s1600/white-disqus-D.png'>");
						break;
					case "fb-comments":
						$tab.prepend("<'http://3.bp.blogspot.com/-WZFew-hmWYs/UcbkHj-2D2I/AAAAAAAAEJw/D0mXysXQP_Q/s1600/white-Facebook-F.png'>");
						break;
					case "get-this":
						$tab.prepend("<'http://3.bp.blogspot.com/-9dSC4V-ERMs/UclFdUjqV_I/AAAAAAAAEKQ/R0F5B-uHzwM/s1600/Get-this.png'>");
						break;
					case "gplus-comments":
						$tab.prepend("<'http://2.bp.blogspot.com/-oAGoAXHbA1s/UdVqbMTj5yI/AAAAAAAAENU/b0lZ9QaO0fc/s210/white-Google-Plus.png'>");
						break;
						
				}
				$tab = null;
			});
						
			getTweetCounts();
			
			var $default = $(".js-default-tab:first"),
				strDefault = "#blogger-comments";
			if($default.length > 0){
				strDefault = "#" + $default.attr("id");
			}
			//Set default tab and page Active
			$activeTab = $(strDefault);
			$activeTab.removeClass("js-inactive-tab");
			
			$activePage = $(strDefault + "-page");			
			$activePage.show();
		},
		getTweetCounts = function(){
		  	$(".js-page-tweet-count").each(
				function(){
					var $count = $(this);
					$.getJSON("http://urls.api.twitter.com/1/urls/count.json?callback=?",
		      	{url: $count.attr("href")},
		         function(json){$count.text(json.count);$count = null;});					   	
				}
			);		   
 	 	},
		selectPage = function() {
			//Set old tab inactive, then set clicked tab active
		  	$activeTab.addClass("js-inactive-tab");
			$activeTab = $(this);
		  	$activeTab.removeClass("js-inactive-tab");
			
			//hide active page, then switch to page associated to clicked tab
		  	$activePage.hide();
		  	$activePage = $("#" + $activeTab.attr("id") + "-page");
		  	$activePage.show();
		};
	$("head").append("<link id='js-comments-pages-styles' rel='stylesheet' type='text/css' href='http://tipsviablogging.github.io/tvbcommentstyle.css'/>");
  	$("document").ready(init);
}();