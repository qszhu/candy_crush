const ROWS = 5;
const COLS = 5;
const WIDTH = 600;
const HEIGHT = 600;

let grid;

function randomShape() {
  const t = floor(random(1) * 4);
  switch (t) {
    case 0:
      return new Triangle();
    case 1:
      return new Square();
    case 2:
      return new Star();
    case 3:
      return new Circle();
  }
}

function setup() {
  createCanvas(WIDTH, HEIGHT);

  grid = new Grid(ROWS, COLS);
  frameRate(7);
}

function draw() {
  background(255);

  grid.update();
  grid.show();
}

function mousePressed() {
  grid.swapStart(mouseX, mouseY);
}

function mouseDragged() {
  grid.markSwap(mouseX, mouseY);
}

function mouseReleased() {
  grid.swap();
}
