const STATE_FALLING = 0;
const STATE_POPING = 1;
const STATE_STABLE = 2;
const STATE_SWAPPING = 3;
const STATE_TRYING_SWAP = 4;
const STATE_SWAPPED_POPING = 5;

class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.dim = width / rows;
    this.reset();
  }

  traverseBU(cb) {
    for (let i = this.rows - 1; i >= 0; i--) {
      for (let j = 0; j < this.cols; j++) {
        if (cb(this.grid[i][j], i, j)) return;
      }
    }
  }

  reset() {
    this.grid = new Array(this.rows)
      .fill()
      .map(() => new Array(this.cols).fill());

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j] = new Cell(i, j, this.dim);
      }
    }

    this.traverseBU((cell, r, c) => {
      if (r - 1 >= 0) cell.topCell = this.grid[r - 1][c];
      if (r + 1 < this.rows) cell.bottomCell = this.grid[r + 1][c];
      if (c - 1 >= 0) cell.leftCell = this.grid[r][c - 1];
      if (c + 1 < this.cols) cell.rightCell = this.grid[r][c + 1];
    });

    this.swaps = [];
    this.state = STATE_FALLING;
  }

  shapesFall() {
    let res = false;
    this.traverseBU((cell, i, j) => {
      if (cell.isEmpty) return;

      if (!cell.bottomCell || !cell.bottomCell.isEmpty) return;

      const shape = cell.removeShape();
      cell.bottomCell.addShape(shape);
      res = true;
    });
    return res;
  }

  dropShape(col, shape) {
    const startCell = this.grid[0][col];
    if (!startCell.isEmpty) return;

    startCell.addShape(shape);
  }

  dropShapes() {
    for (let j = 0; j < this.cols; j++) {
      this.dropShape(j, randomShape());
    }
  }

  isFull() {
    let res = true;
    this.traverseBU((cell) => {
      if (cell.isEmpty) {
        res = false;
        return true;
      }
    });
    return res;
  }

  popShapes() {
    this.traverseBU((cell) => {
      cell.shouldPop = void 0;
    });

    this.traverseBU((cell) => {
      this.markPop(cell);
    });

    this.traverseBU((cell) => {
      if (cell.shouldPop) cell.removeShape();
    });
  }

  markPop(cell) {
    if (cell.shouldPop !== void 0) return;

    cell.shouldPop = false;
    if (cell.isEmpty) return;

    this.markRowPop(cell);
    this.markColPop(cell);
  }

  hasSameShape(cell1, cell2) {
    if (cell1.isEmpty || cell2.isEmpty) return false;
    return cell1.shape.constructor.name === cell2.shape.constructor.name;
  }

  markRowPop(cell) {
    let cnt = 1;

    let left = cell;
    while (left.leftCell && this.hasSameShape(left.leftCell, cell)) {
      cnt++;
      left = left.leftCell;
    }

    let right = cell;
    while (right.rightCell && this.hasSameShape(right.rightCell, cell)) {
      cnt++;
      right = right.rightCell;
    }

    if (cnt >= 3) {
      let c
      for (c = left; c !== right; c = c.rightCell) {
        c.shouldPop = true;
      }
      c.shouldPop = true;
    }
  }

  markColPop(cell) {
    let cnt = 1;

    let top = cell;
    while (top.topCell && this.hasSameShape(top.topCell, cell)) {
      cnt++;
      top = top.topCell;
    }

    let bottom = cell;
    while (bottom.bottomCell && this.hasSameShape(bottom.bottomCell, cell)) {
      cnt++;
      bottom = bottom.bottomCell;
    }

    if (cnt >= 3) {
      let c
      for (c = top; c !== bottom; c = c.bottomCell) {
        c.shouldPop = true;
      }
      c.shouldPop = true;
    }
  }

  findCell(x, y) {
    let res;
    this.traverseBU((cell) => {
      if (cell.contains(x, y)) {
        res = cell;
        return true;
      }
    });
    return res;
  }

  pushSwap(cell) {
    cell.selected = true;
    this.swaps.push(cell);
  }

  popSwap() {
    const cell = this.swaps.pop();
    cell.selected = false;
    return cell;
  }

  clearSwaps() {
    while (this.swaps.length > 0) {
      this.popSwap();
    }
  }

  swapStart(mouseX, mouseY) {
    if (this.state !== STATE_STABLE) return;

    const cell = this.findCell(mouseX, mouseY);
    if (!cell) return;

    this.clearSwaps();
    this.pushSwap(cell);
    this.state = STATE_SWAPPING;
  }

  isNeighbor(cell1, cell2) {
    return (
      cell1 === cell2.leftCell ||
      cell1 === cell2.rightCell ||
      cell1 === cell2.topCell ||
      cell1 === cell2.bottomCell
    );
  }

  markSwap(mouseX, mouseY) {
    if (this.state !== STATE_SWAPPING) return;

    const cell = this.findCell(mouseX, mouseY);
    if (!cell) return;

    const cell0 = this.swaps[0];
    if (cell === cell0) return;

    if (!this.isNeighbor(cell, cell0)) return;

    if (this.swaps.length === 2) this.popSwap();
    this.pushSwap(cell);
  }

  swap() {
    if (this.state !== STATE_SWAPPING) return;

    if (this.swaps.length !== 2) {
      this.clearSwaps();
      this.state = STATE_STABLE;
      return;
    }

    const [cell1, cell2] = this.swaps;
    cell1.selected = false;
    cell2.selected = false;
    this.state = STATE_TRYING_SWAP;
  }

  doSwap() {
    if (this.swaps.length !== 2) return;

    const [cell1, cell2] = this.swaps;
    const shape1 = cell1.removeShape();
    const shape2 = cell2.removeShape();
    cell1.addShape(shape2);
    cell2.addShape(shape1);
  }

  gameOver() {
    this.reset();
  }

  update() {
    if (this.state === STATE_FALLING) {
      this.shapesFall();
      this.dropShapes();
      if (this.isFull()) {
        this.state = STATE_POPING;
      }
    } else if (this.state === STATE_POPING) {
      this.popShapes();
      if (this.isFull()) {
        this.state = STATE_STABLE;
      } else {
        this.state = STATE_FALLING;
      }
    } else if (this.state === STATE_TRYING_SWAP) {
      this.doSwap();
      this.state = STATE_POPING;
    } else if (this.state === STATE_SWAPPED_POPING) {
      this.popShapes();
      if (this.isFull()) {
        // nothing poped, reverting swaps
        this.doSwap();
        this.state = STATE_STABLE;
      } else {
        this.state = STATE_FALLING;
      }
      this.clearSwaps();
    }
  }

  show() {
    this.traverseBU((cell) => cell.show());
  }
}
