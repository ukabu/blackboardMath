App = {
  problems: null,
  statisticsTracking: true,
  track: function(category, action, label, value) {
    if (!this.statisticsTracking || window._gaq === undefined) return;
    
    var event = ['_trackEvent'];
    event.push(category);
    event.push(action);
    if (label !== undefined) {
      event.push(label);
      if (value !== undefined) event.push(value);
    }
    
    window._gaq.push(event);
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
  load: function() {
    jo.load();

    this.scn = new joScreen(
      new joContainer([
	new joFlexcol([
	  this.nav = new joNavbar(),
	  this.stack = new joStack()
	]),
	this.toolbar = new joToolbar("Learn you math tables in a flash!")
      ]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
    );
    
    this.nav.setStack(this.stack);
    
    this.stack.push(joCache.get("menu"));
    
    joGesture.backEvent.subscribe(this.stack.pop, this.stack);
    if (this.statisticsTracking) {
      Analytics.load();
    }

    if (window.PalmSystem) {
      window.PalmSystem.stageReady();
      window.PalmSystem.setWindowOrientation('free');
    }
  }
};
