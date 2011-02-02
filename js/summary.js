// using joCache here to defer creation of this
// view until we actually use it
SummaryCard = function() {
  this.summary = new joRecord();
  this.nGoodAnswers = this.summary.link("nGoodAnswers");
  this.nBadAnswers = this.summary.link("nBadAnswers");
  this.timeElapsed = this.summary.link("timeElapsed");
  
  joCard.call(this, [
    new joTitle("Summary"),
    new joLabel("Good answers"),
    new joCaption(this.nGoodAnswers),
    new joLabel("Bad answers"),
    new joCaption(this.nBadAnswers),
    new joLabel("Time to complete"),
    new joCaption(this.timeElapsed),
    new joButton("Dismiss").selectEvent.subscribe(function() {
      App.stack.showHome();
    })
  ]);
  this.setTitle("Blackboard / Math!");
};

SummaryCard.extend(joCard, {
  apply: function(problems) {
    this.summary.setData(problems);
    return this;
  }
});

joCache.set("summary", function() {
  return new SummaryCard();
});
