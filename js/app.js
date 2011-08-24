
uNavbar = function(title) {
  if (title) this.firstTitle = title;

  var ui = [
    this.titlebar = new joView(title || '&nbsp;').setStyle('title'),
    new joFlexrow([this.back = new joBackButton('Back').selectEvent.subscribe(this.goBack, this), ""])
  ];

  joContainer.call(this, ui);
};

uNavbar.extend(joContainer, {
  tagName: "jonavbar",
	stack: null,

	goBack: function() {
		if (this.stack)
			this.stack.showHome();

		return this;
	},

	setStack: function(stack) {
		if (this.stack) {
			this.stack.pushEvent.unsubscribe(this.update, this);
			this.stack.popEvent.unsubscribe(this.update, this);
		}

		if (!stack) {
			this.stack = null;
			return this;
		}

		this.stack = stack;

		stack.pushEvent.subscribe(this.update, this);
		stack.popEvent.subscribe(this.update, this);

		this.refresh();

		return this;
	},

	update: function() {
		if (!this.stack)
			return this;

		joDOM.removeCSSClass(this.back, 'selected');
		joDOM.removeCSSClass(this.back, 'focus');

//		console.log('update ' + this.stack.data.length);

		if (this.stack.data.length > 1)
			joDOM.addCSSClass(this.back, 'active');
		else
			joDOM.removeCSSClass(this.back, 'active');

		var title = this.stack.getTitle();

		if (typeof title === 'string')
			this.titlebar.setData(title);
		else
			this.titlebar.setData(this.firstTitle);

		return this;
	},

	setTitle: function(title) {
		this.titlebar.setData(title);
		this.firstTitle = title;

		return this;
	}
});

App = {
  problems: null,
  nextProblem: function() {
    //this.stack.showHome();
    
    problem = this.problems.next();
    this.problems.startTimer();
    if (problem) {
      this.stack.push(joCache.get("problem").newProblem(problem));
    } else {
      this.problems.stopTimer();
      this.stack.push(joCache.get("summary").apply(this.problems));
    }
  },
  showDocument: function(url) {
    if (window.PalmSystem) {
      var serviceBridge = new PalmServiceBridge();
      serviceBridge.call("palm://com.palm.applicationManager/open", JSON.stringify({
        target: url
      }));
    } else {
      window.open(url, "_new");
    }
    App.scn.hidePopup();
  },
  doNetworkOperation: function(callback) {
    if (!window.PalmSystem) {
      // not on webOS, we assume network is present
      callback();
      return;
    }
    
    var serviceBridge = new PalmServiceBridge();
    serviceBridge.onservicecallback = this. doNetworkBridgeCall = function(stringresponse) {
      var response = JSON.parse(stringresponse);
      if (response.isInternetConnectionAvailable) {
        callback();
      }
    };
    serviceBridge.call("palm://com.palm.connectionmanager/getStatus");
  },
  load: function() {
    this.preferences = new joRecord(this);
    this.preferences.load = function() {
      this.data.statisticsTracking = localStorage.getItem('statisticsTracking') !== 'false';
      this.data.typingDirection = localStorage.getItem('typingDirection') || 'l2r';
    };
    this.preferences.save = function() {
      localStorage.setItem('statisticsTracking', this.data.statisticsTracking);
      localStorage.setItem('typingDirection', this.data.typingDirection);
    };
    
    this.preferences.load();
    
    var tracking = this.preferences.link("statisticsTracking");
    
    this.helpPopup = [
      new joTitle("About"),
      new joGroup([
//        new joFlexrow([new joCaption('Collect anonymous statistics'), new joToggle(tracking)]),
        new joButton("Homepage").selectEvent.subscribe(function() {this.showDocument("https://github.com/ukabu/blackboardMath#readme");}.bind(this)),
        new joButton("Support").selectEvent.subscribe(function() {this.showDocument("https://github.com/ukabu/blackboardMath/issues");}.bind(this)),
        new joButton("Share / Rate").selectEvent.subscribe(function() {this.showDocument("http://developer.palm.com/appredirect/?packageid=net.ukabu.blackboardmath");}.bind(this))
      ]),
      new joButton("Dismiss").selectEvent.subscribe(function() { App.scn.hidePopup(); })
    ];

    this.scn = new joScreen(
      new joContainer([
        new joFlexcol([
          this.nav = new uNavbar(),
          this.stack = new joStackScroller()
        ]),
        this.toolbar = new joToolbar("Learn your math tables in a flash!")
      ]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
    );
    
    this.nav.setStack(this.stack);

    joDefer(function() {
      var style = new joCSSRule('jostack > joscroller > .menu:last-child:after { content: ""; display: block; height: ' + (App.toolbar.container.offsetHeight) + 'px; }');
    });
    
    joGesture.backEvent.subscribe(this.nav.goBack, this.nav);

    this.stack.push(joCache.get("menu"));
  },
  ready: function() {
    setTimeout(function() {
      if (window.PalmSystem) {
        window.PalmSystem.stageReady();
        window.PalmSystem.setWindowOrientation('free');
      }
    }.bind(this), 1);
  }
};
