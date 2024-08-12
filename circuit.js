class CircuitUtils {

  static randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
class CircuitLine {

  constructor(x, y, moveXBy) {
    console.log("A circuit line was created");
    // Initial values
    this.initialX = x;
    this.initialY = y;
    this.moveXBy = moveXBy;
    // Step values
    this.currentX = null;
    this.currentY = null;
    this.currentStep = 0;
    this.stepsData = [];
    this.step();
  }

  addStep(newStep) {
    console.log("NEWSTEP", newStep);
    this.stepsData.push(newStep);
    this.currentStep++;
  }

  step() {
    console.log("The step " + this.currentStep + " of a line was calculated");
    if (this.currentStep == 0) {
      let newStep = {
        'type': 'moveTo',
        'data': {
          'x': this.initialX,
          'y': this.initialY
        }
      };
      this.addStep(newStep);

      this.currentX = this.initialX + this.moveXBy;
      this.currentY = this.initialY;
      newStep = {
        'type': 'lineTo',
        'data': {
          'x': this.currentX,
          'y': this.currentY
        }
      };
      this.addStep(newStep);
    } else {

    }
  }

}
class Circuit {

  constructor(canvasTarget, maxLines, maxSpeed, milisecondsBetweenStep) {
    console.log("The circuit effect gets created");
    this.canvas = document.getElementById(canvasTarget);
    this.context = this.canvas.getContext('2d');
    this.maxLines = maxLines;
    this.maxSpeed = maxSpeed;
    this.milisecondsBetweenStep = milisecondsBetweenStep;
    this.lines = [];
    this.initialize();
  }

  addLine(newLine) {
    console.log("Adding a new line to the circuit");
    this.lines.push(newLine);
  }

  initialize() {
    console.log("The circuit effect was initialized");
    let initialX, initialY, moveXBy, i;

    // Create the lines to be moved in the circuit
    for (i = 0; i < this.maxLines; i++) {
      initialX = CircuitUtils.randRange(0, this.canvas.width);
      initialY = CircuitUtils.randRange(0, this.canvas.height);
      moveXBy = CircuitUtils.randRange(0, maxSpeed);
      this.addLine(new CircuitLine(initialX, initialY, moveXBy));

    }
    console.log("The circuit lines were created");

    // Execute the test just one time
    this.draw();

    // Start the process to animate :) Yay
    //const testInterval = setInterval(this.draw, this.milisecondsBetweenStep);
  }

  clear() {
  	console.log("Clear the previous circuit frame and draws a new step");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Every step it ticks we clear and redraw the lines using their information
  draw() {
    this.clear();
    
    let counter, stepCounter, currentLine, currentStep, stepsData;
    // We should draw every line
    for (counter = 0; counter < this.lines.length; counter++) {
      // And we should draw every step of the line
      currentLine = this.lines[counter];
      stepsData = currentLine.stepsData;

      for (stepCounter = 0; stepCounter < stepsData.length; stepCounter++) {
        currentStep = stepsData[stepCounter];
        
        // Move the cursor to the anchor of that line
        switch (currentStep.type) {
          case 'moveTo':
          	this.context.beginPath();
          	this.context.strokeStyle = 'blue';
            this.context.moveTo(currentStep.data.x, currentStep.data.y);
            console.log("beginPath()");
          	console.log("strokeStyle = 'blue'");
            console.log("moveTo(" + currentStep.data.x + "," + currentStep.data.y + ")");
            break;
          case 'lineTo':
            this.context.lineTo(currentStep.data.x, currentStep.data.y);
            this.context.stroke();
            console.log("lineTo(" + currentStep.data.x  + "," + currentStep.data.y + ")");
            console.log("stroke()");
            break;
        }
      }
    }
  }

}

let maxLines = 10;
let maxSpeed = 50;
let milisecondsBetweenStep = 100;
let myCircuit = new Circuit('circuitCanvas', maxLines, maxSpeed, milisecondsBetweenStep);
