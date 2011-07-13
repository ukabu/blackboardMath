App = {
  problems: null,
  statisticsTracking: true,
  inTrackingSession: function(callback) {
    if (!this.statisticsTracking) return;
    
    if (this.agentStatus === 'loaded') {
      this.doNetworkOperation(function() {
	callback(window.capptain.agent);
      }.bind(this));
    } else if (this.agentStatus === 'loading') {
      setTimeout(this.inTrackingSession.bind(this), 50, callback);
    } else {
      this.doNetworkOperation(function() {
	this.loadAnalytics(callback);
      }.bind(this));
    }
  },
  track: function(category, action, label, value) {
    this.inTrackingSession(function(agent) {
      agent.sendSessionEvent(action, {label: label, value: value});
    }.bind(this));
  },
  nextProblem: function() {
    this.stack.showHome();
    problem = this.problems.next();
    this.problems.startTimer();
    if (problem) {
      this.track("App", "NextProblem");
      this.stack.push(joCache.get("problem").newProblem(problem));
    } else {
      this.problems.stopTimer();
      this.track("App", "End", "Good Answers", this.problems.nGoodAnswers);
      this.track("App", "End", "Bad Answers", this.problems.nBadAnswers);
      this.track("App", "End", "Total Time", this.problems.totalTime);
      this.stack.push(joCache.get("summary").apply(this.problems));
    }
  },
  showDocument: function(url) {
    App.track("App", "Information", url);
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
    }
    serviceBridge.call("palm://com.palm.connectionmanager/getStatus");
  },
  load: function() {
    this.preferences = new joRecord(this);
    this.preferences.load = function() {
      this.data.statisticsTracking = localStorage.getItem('statisticsTracking') !== 'false';
      this.data.typingDirection = localStorage.getItem('typingDirection') || 'l2r';
    }
    this.preferences.save = function() {
      localStorage.setItem('statisticsTracking', this.data.statisticsTracking);
      localStorage.setItem('typingDirection', this.data.typingDirection);
    }
    
    this.preferences.load();
    
    var tracking = this.preferences.link("statisticsTracking");
    
    var helpPopup = [
      new joTitle("Information"),
      new joGroup([
	new joFlexrow([new joCaption('Collect anonymous statistics'), new joToggle(tracking)]),
	new joButton("Homepage").selectEvent.subscribe(function() {this.showDocument("https://github.com/ukabu/blackboardMath#readme");}.bind(this)),
	new joButton("Support").selectEvent.subscribe(function() {this.showDocument("https://github.com/ukabu/blackboardMath/issues");}.bind(this)),
	new joButton("Share / Rate").selectEvent.subscribe(function() {this.showDocument("http://developer.palm.com/appredirect/?packageid=net.ukabu.blackboardmath");}.bind(this))
      ]),
      new joButton("Dismiss").selectEvent.subscribe(function() { App.scn.hidePopup(); })
    ];

    this.scn = new joScreen(
      new joContainer([
	new joFlexcol([
	  this.nav = new joNavbar(),
	  this.stack = new joStack()
	]),
	this.toolbar = new joToolbar([
	  new joButton("i").selectEvent.subscribe(function() {
	    App.scn.showPopup(helpPopup);
	  }),
	  "Learn you math tables in a flash!"
	])
      ]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
    );
    
    this.nav.setStack(this.stack);
    
    
    joGesture.backEvent.subscribe(this.stack.pop, this.stack);

    this.stack.push(joCache.get("menu"));
  },
  ready: function() {
    setTimeout(function() {
      if (window.PalmSystem) {
	window.PalmSystem.stageReady();
	window.PalmSystem.setWindowOrientation('free');
      }
      
      this.track('App', 'ready');
    }.bind(this), 1);
  },
  loadAnalytics: function(callback) {
    this.agentStatus = 'loading';
    
    setTimeout(function() {
      joScript("js/capptain-sdk-web-0.7.0/capptain-sdk.js", function(error) {
	window.capptain.agent.startActivity('welcome');
	callback(window.capptain.agent);
	this.agentStatus = 'loaded';
      }.bind(this));
    }.bind(this), 1);
  }
};
