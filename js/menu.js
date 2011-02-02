// using joCache here to defer creation of this
// view until we actually use it
joCache.set("menu", function() {
  // some inline data and chaining going on here,
  // dont be afraid, it'll all make sense later
  var preferences = new joRecord({
    operator: "+",
    qty: 25,
    difficulty: 12
  });
  
  var card = new joCard([
    new joLabel("Operator"),
    new joOption([
      {title: "+", id: "+"},
      {title: "-", id: "-"},
      {title: "x", id: "x"},
      {title: "/", id: "/"}
      ], preferences.link("operator")).setStyle("operator").setValue(0),
    new joLabel("Number of problems"),
    new joOption([{title: "10", id: 10}, {title: "25", id: 25}, {title: "50", id: 50}], preferences.link("qty")).setValue(1),
    new joLabel("Difficulty"),
    new joOption([{title: "Normal", id: 12}, {title: "Hard", id: 24}], preferences.link("difficulty")).setValue(0),
    new joButton("Start").selectEvent.subscribe(function() {
      App.problems = new Problems(preferences.getProperty("operator"), preferences.getProperty("qty"), preferences.getProperty("difficulty"));
      App.nextProblem();
    })
  ]).setTitle("Blackboard / Math!");
  
  return card;
});
