class Shape {
  attachToCell(cell) {
    this.x = cell.centerX;
    this.y = cell.centerY;
    this.w = cell.w * 0.4;
    this.updatePoints();
    cell.addShape(this);
  }

  show() {
    stroke(0);
    fill(...this.c);
    beginShape();
    for (const [x, y] of this.points) {
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  calcPoints(n, s, r) {
    // TODO: align to center of gravity
    r = r || 1;
    const res = [];
    const d = TWO_PI / n;
    for (let angle = 0; angle < TWO_PI; angle += d) {
      const x1 = cos(angle + s) * this.w * r;
      const y1 = sin(angle + s) * this.w * r;
      res.push([this.x + x1, this.y + y1]);
    }
    return res;
  }
}

class Triangle extends Shape {
  constructor() {
    super();
    this.c = [255, 255, 0];
  }

  updatePoints() {
    this.points = this.calcPoints(3, -HALF_PI);
  }
}

class Square extends Shape {
  constructor() {
    super();
    this.c = [0, 0, 255];
  }

  updatePoints() {
    this.points = this.calcPoints(4, -PI / 4);
  }
}

class Star extends Shape {
  constructor() {
    super();
    this.c = [255, 0, 0];
  }

  updatePoints() {
    const outer = this.calcPoints(5, -HALF_PI);
    const inner = this.calcPoints(5, -PI / 3.3, 0.4); // TODO: try more accurate value
    this.points = [];
    for (let i = 0; i < 5; i++) {
      this.points.push(outer[i], inner[i]);
    }
  }
}

class Circle extends Shape {
  constructor() {
    super();
    this.c = [0, 255, 0];
  }

  updatePoints() {
    this.points = this.calcPoints(32, 0);
  }
}
