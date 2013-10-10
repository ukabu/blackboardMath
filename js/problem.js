Problem = function(options) {
};

Problem.operand = function(difficulty, allowZero) {
  return Math.floor(allowZero ? Math.random() * (difficulty + 1) : (Math.random() * difficulty) + 1);
}

Problem.generate = function(operator, difficulty) {
  var problem = new Problem();
  
  problem.operand1 = Problem.operand(difficulty);
  problem.operand2 = Problem.operand(difficulty, operator != "/");
  problem.operator = operator;

  switch(operator) {
    case "+" :
      problem.solution = problem.operand1 + problem.operand2;
      break;
    case "-" :
      problem.solution = problem.operand1 - problem.operand2;
      break;
    case "x" :
      problem.solution = problem.operand1 * problem.operand2;
      break;
    case "/" :
      problem.solution = problem.operand1;
      problem.operand1 = problem.solution * problem.operand2;
      break;
  }
  
  return problem;
};
Problem.prototype = {
  validate: function(answer) {
    answer = parseInt(answer, 10);
    this.success = answer == this.solution;
    this.skipped = false;
    
    return this.success;
  }
};

Problems = function(operator, qty, difficulty, typingDirection) {
  this.operator = operator;
  this.qty = qty;
  this.difficulty = difficulty;
  this.iCurrent = -1;
  this.problems = new Array(qty);
  this.totalTime = 0;
  this.typingDirection = typingDirection || "l2r";

  for (var i = 0; i < this.problems.length; i++) {
    this.problems[i] = Problem.generate(operator, difficulty);
  }
};

Problems.prototype = {
  startTimer: function() {
    if (!this.timerInstant) {
      this.timerInstant = Date.now();
    }
  },
  stopTimer: function() {
    if (this.timerInstant) {
      this.totalTime += (Date.now() - this.timerInstant);
    }
    this.timerInstant = null;
  },
  get timeElapsed() {
    this.stopTimer();
    var sec = Math.floor(this.totalTime / 1000) % 60;
    var min = Math.floor(this.totalTime / (60 * 1000));
    
    return "" + min + " minutes and " + sec + " seconds";
  },
  set timeElapsed(ignore) {},
  next: function() {
    if (this.iCurrent < this.problems.length) {
      this.iCurrent++;
    }
    
    return this.problems[this.iCurrent]
  },
  get nGoodAnswers() {
    var n = 0;
    this.problems.forEach(function(problem) {
      if (problem.success) n++;
    });
    return n;
  },
  set nGoodAnswers(ignore) {},
  get nBadAnswers() {
    var n = 0;
    this.problems.forEach(function(problem) {
      if (!problem.success) n++;
    });
    return n;
  },
  set nBadAnswers(ignore) {}
};

uChalk = function(data) {
  joControl.apply(this, arguments);
};
uChalk.extend(joControl, {
  tagName: 'uChalk',
  draw: function() {
    if (this.data == null || this.data === "") {
      return;
    }
    this.container.innerHTML = "<span></span>"+this.data;
  }
});

uNumber = function(data) {
  joControl.apply(this, arguments);
};

uNumber.extend(joControl,  {
  tagName: "uNumber",
  draw: function() {
    this.drawText.apply(this, arguments);
  },
  drawText: function() {
    if (this.data == null || this.data === "") {
      return;
    }
    var data = parseInt(this.data);
    var minus = data < 0 || this.data == "-";
    data = isNaN(data) ? "" : Math.abs(data).toString();

    var text = minus ? "-"+data : data;
    this.container.innerHTML = "<span></span>"+text;
  },
  drawImage: function() {
    if (this.data == null || this.data === "") {
      return;
    }

    var data = parseInt(this.data);
    var minus = data < 0 || this.data == "-";
    data = isNaN(data) ? "" : Math.abs(data).toString();
    
    if (minus) {
      this.container.appendChild(new joHTML("-").setStyle({className: "minus"}).container);
    }
    for (i = 0; i < data.length; i++) {
      this.container.appendChild(new joHTML("<img src='numbers.png' />").setStyle({className: "n"+data[i]}).container);
    }
  }
});

ProblemCard = function() {
  this.problem = new joRecord();
  this.operand1 = this.problem.link("operand1");
  this.operand2 = this.problem.link("operand2");
  this.operator = this.problem.link("operator");
  this.solution = this.problem.link("solution");
  this.answer = new joRecord({answer: ""}).link("answer");

  joCard.call(this, [this.equationPanel = new joContainer([
      new joContainer([
        new uChalk(this.operator).setStyle({id: "operator"}),
        new joContainer([
          new uNumber(this.operand1).setStyle({id: "operand1"}),
          new uNumber(this.operand2).setStyle({id: "operand2"})
        ]).setStyle({id:"operands"})
      ]).setStyle({id: "question"}),
      new joHTML("<div class='chalk'><span></span><hr/></div>").setStyle("total"),
      this.answerControl = new uNumber(this.answer).setStyle({id: "answer"})
    ]).setStyle({id:"equation"}),
    this.keypadPanel = new Keypad().setStyle({id: "keypad"})
      .numberKeyEvent.subscribe(this.numberKeyPressed.bind(this))
      .equalsKeyEvent.subscribe(this.equalsKeyPressed.bind(this))
      .eraseKeyEvent.subscribe(this.eraseKeyPressed.bind(this))
      .plusMinusKeyEvent.subscribe(this.minusKeyPressed.bind(this))
  ])
  this.setTitle("Blackboard / Math!!!").setStyle({id: "problem"});
}
ProblemCard.extend(joCard, {
  newProblem: function(problem) {
    this.problem.setData(problem);
    this.answer.setData("");
    
    return this;
  },
  numberKeyPressed: function(button) {
    var a = this.answer.getData();
    var sign = a.charAt(0) == "-" ? "-" : ""
    var number = a.substring(sign.length);
    
    if (number.length < 3) {
      if (App.problems.typingDirection === 'l2r') {
        this.answer.setData(sign + number + button);
      } else {
        this.answer.setData(sign + button + number);
      }
    }
  },
  minusKeyPressed: function() {
    var a = this.answer.getData();
    var sign = a.charAt(0) == "-" ? "-" : ""
    var number = a.substring(sign.length);
    
    this.answer.setData((sign == "-" ? "" : "-") + number);
  },
  eraseKeyPressed: function() {
    var a = this.answer.getData();
    var sign = a.charAt(0) == '-' ? '-' : '';
    var number = a.substring(sign.length);
    
    if (App.problems.typingDirection === 'l2r') {
      this.answer.setData(a.substring(0, a.length - 1));
    } else {
      this.answer.setData(sign + number.substring(1));
    }
  },
  equalsKeyPressed: function() {
    this.problem.getData().validate(this.answer.getData()) ? this.showGoodAnswer() : this.showBadAnswer();
  },
  showGoodAnswer: function() {
    this.keypadPanel.clear();
    this.push(new uCongrats().setStyle({id: "congrats", className: ["swirl", "explode", "heartbeat"][Math.floor(Math.random() * 3)]}));
    this.push(new joControl().setStyle({id:"nextProblem"}).selectEvent.subscribe(function(){
      App.nextProblem();
    }));
  },
  showBadAnswer: function() {
    if (this.answer.getData() === "") this.answer.setData(0);
    this.answerControl.setStyle("strike");
    this.equationPanel.push(new uNumber(this.solution).setStyle({id: "solution", className: "shake"}));
    this.keypadPanel.clear();
    this.push(new joControl(
    ).setStyle({id:"nextProblem"}).selectEvent.subscribe(function(){
      App.nextProblem();
    }));
  }
});

uButton = function(data) {
  joButton.apply(this, arguments);
};

uButton.extend(joButton, {
  setEvents: function() {
    // we completely overide joControl setEvent so it does not capture click events
    // hackish way to make button clicks work on webos.
    joEvent.capture(this.container, joEvent.touchy ? 'click' : 'mousedown', this.onMouseDown, this);
    joEvent.on(this.container, "blur", this.onBlur, this);
    joEvent.on(this.container, "focus", this.onFocus, this);
  },
  focus: function() {
    joControl.prototype.focus.apply(this, arguments);
    joDefer(joFocus.clear, joFocus, 500);
  },
  blur: function() {
    joControl.prototype.blur.apply(this, arguments);
    this.container.blur();
  }
});

Keypad = function() {
  this.numberKeyEvent = new joSubject(this);
  this.equalsKeyEvent = new joSubject(this);
  this.eraseKeyEvent = new joSubject(this);
  this.plusMinusKeyEvent = new joSubject(this);
  var self = this;
  
  var newKey = function(label, listener) { return new joButton(label).selectEvent.subscribe(listener.bind(self)); };

  joContainer.call(this, [[
    new joFlexrow([newKey("1", this.numberKeyPressed), newKey("2", this.numberKeyPressed), newKey("3", this.numberKeyPressed)]),
    new joFlexrow([newKey("4", this.numberKeyPressed), newKey("5", this.numberKeyPressed), newKey("6", this.numberKeyPressed)]),
    new joFlexrow([newKey("7", this.numberKeyPressed), newKey("8", this.numberKeyPressed), newKey("9", this.numberKeyPressed)]),
    new joFlexrow([newKey("&plusmn;", this.plusMinusKeyPressed), newKey("0", this.numberKeyPressed), new joCaption("&nbsp;")]),
    new joFlexrow([newKey("&larr;", this.eraseKeyPressed), newKey("=", this.equalsKeyPressed)])
  ]]);
}
Keypad.extend(joContainer, {
  numberKeyPressed: function(number) {
    this.numberKeyEvent.fire(number);
  },
  equalsKeyPressed: function() {
    this.equalsKeyEvent.fire();
  },
  eraseKeyPressed: function() {
    this.eraseKeyEvent.fire();
  },
  plusMinusKeyPressed: function() {
    this.plusMinusKeyEvent.fire();
  }
});

uCongrats = function(data) {
  if (!data) {
    data = ["Great !", "Bravo !", "Nice !", "Good !"][Math.floor(Math.random() * 4)];
  }
  joControl.apply(this, [data]);
};

uCongrats.extend(joControl, {
  tagName: "uCongrats",
  draw: function() {
    var data = this.data ? this.data.toString() : "Great !";
    this.container.innerHTML = '<span></span>'+data+'';
  }
});
