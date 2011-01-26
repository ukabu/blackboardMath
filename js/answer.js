uCongrats = function(data) {
  joControl.apply(this, [data || "great"]);
};

uCongrats.extend(joControl, {
  tagName: "uCongrats",
  draw: function() {
    var data = this.data ? this.data.toString() : "great";
    this.container.appendChild(new joHTML("<img src='congrats.png' />").setStyle({className: data}).container);
  }
});

BadAnswerCard = function() {
  this.problem = new joRecord();
  this.operand1 = this.problem.link("operand1");
  this.operand2 = this.problem.link("operand2");
  this.operator = this.problem.link("operator");
  this.solution = this.problem.link("solution");
  this.answer = new joRecord({answer: ""}).link("answer");

  joCard.call(this, [new joContainer([
      // TODO Refactor this to remove duplication in ProblemCard and GoodAnswerCard
      new joContainer([
        new joCaption(this.operator).setStyle({id: "operator"}),
        new joContainer([
          new uNumber(this.operand1).setStyle({id: "operand1"}),
          new uNumber(this.operand2).setStyle({id: "operand2"})
        ]).setStyle({id:"operands"})
      ]).setStyle({id: "question"}),
      new joHTML("<hr />").setStyle("total"),
      new uNumber(this.answer).setStyle({id: "answer", className: "strike"}),
      new uNumber(this.solution).setStyle({id: "solution"})
    ]).setStyle({id:"equation"}),
    new joControl(
    ).setStyle({id:"nextProblem"}).selectEvent.subscribe(function(){
      App.nextProblem();
    })
  ])
  this.setTitle("Flash Math!!!").setStyle({id: "problem"});
}
BadAnswerCard.extend(joCard, {
  apply: function(problem, answer) {
    this.problem.setData(problem);
    this.answer.setData(answer);
    
    return this;
  }
});

GoodAnswerCard = function() {
  this.problem = new joRecord();
  this.operand1 = this.problem.link("operand1");
  this.operand2 = this.problem.link("operand2");
  this.operator = this.problem.link("operator");
  this.solution = this.problem.link("solution");
  this.answer = new joRecord({answer: ""}).link("answer");
  this.congrats = new joRecord({congrats: "great"}).link("congrats");

  joCard.call(this, [
    new joContainer([
      new joContainer([
        new joCaption(this.operator).setStyle({id: "operator"}),
        new joContainer([
          new uNumber(this.operand1).setStyle({id: "operand1"}),
          new uNumber(this.operand2).setStyle({id: "operand2"})
        ]).setStyle({id:"operands"})
      ]).setStyle({id: "question"}),
      new joHTML("<hr />").setStyle("total"),
      new uNumber(this.answer).setStyle({id: "answer"}),
      new uCongrats(this.congrats).setStyle({id: "congrats"})
    ]).setStyle({id:"equation"}),
    new joControl().setStyle({id:"nextProblem"}).selectEvent.subscribe(function(){
      App.nextProblem();
    })
  ])
  this.setTitle("Flash Math!!!").setStyle({id: "problem"});
}
GoodAnswerCard.extend(joCard, {
  apply: function(problem, answer) {
    this.problem.setData(problem);
    this.answer.setData(answer);
    this.congrats.setData(["great", "bravo", "nice", "good"][Math.floor(Math.random() * 4)]);
    
    return this;
  }
});

joCache.set("goodAnswer", function() {
  var card = new GoodAnswerCard();
  
  return card;
});
joCache.set("badAnswer", function() {
  var card = new BadAnswerCard();
  
  return card;
});
