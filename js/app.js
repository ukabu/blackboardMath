App = {
  problems: null,
  statisticsTracking: true,
  track: function(category, action, label, value) {
    if (!this.statisticsTracking) return;
    
    window.capptain.agent.sendSessionEvent(action, {label: label, value: value});
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
  load: function() {
    var helpPopup = [
      new joTitle("Information"),
      new joGroup([
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
      
      this.loadAnalytics();
    }.bind(this), 1);
  },
  loadAnalytics: function() {
    if (!this.statisticsTracking) return;
    setTimeout(function() {
      joScript("js/capptain-sdk-web-0.7.0/capptain-sdk.js", function(error) {
	window.capptain.agent.startActivity('welcome');
      });
    }.bind(this), 1);
  }
};
