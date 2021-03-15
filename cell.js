class Cell {
  constructor(r, c, w) {
    this.w = w;
    this.x = c * w;
    this.y = r * w;
    this.topCell = null;
    this.bottomCell = null;
    this.leftCell = null;
    this.rightCell = null;
    this.shape = null;
    this.selected = false;
  }

  contains(x, y) {
    return (
      x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w
    );
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  get centerY() {
    return this.y + this.w / 2;
  }

  get isEmpty() {
    return this.shape === null;
  }

  addShape(shape) {
    if (!this.isEmpty) return;
    this.shape = shape;
    shape.attachToCell(this);
  }

  removeShape() {
    const res = this.shape;
    this.shape = null;
    return res;
  }

  show() {
    push();
    if (this.selected) {
      stroke(255, 0, 255);
      strokeWeight(5);
    } else {
      stroke(0);
      strokeWeight(1);
    }
    fill(200);
    rect(this.x, this.y, this.w, this.w);
    pop();

    if (this.shape) this.shape.show();
  }
}
