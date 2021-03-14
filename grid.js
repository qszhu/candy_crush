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

  reset() {
    this.grid = new Array(rows).fill().map(() => new Array(cols).fill());
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = new Cell(i, j, this.dim);
        this.grid[i][j] = cell;
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        if (i - 1 >= 0) cell.topCell = this.grid[i - 1][j];
        if (i + 1 < rows) cell.bottomCell = this.grid[i + 1][j];
        if (j - 1 >= 0) cell.leftCell = this.grid[i][j - 1];
        if (j + 1 < cols) cell.rightCell = this.grid[i][j + 1];
      }
    }

    this.swaps = [];
    this.state = STATE_FALLING;
  }

  dropShape(col, shape) {
    const startCell = this.grid[0][col];
    if (!startCell.isEmpty) return;

    shape.attachToCell(startCell);
  }

  dropShapes() {
    for (let j = 0; j < cols; j++) {
      this.dropShape(j, randomShape());
    }
  }

  shapesFall() {
    let res = false;
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        if (cell.isEmpty) continue;
        if (!cell.bottomCell || !cell.bottomCell.isEmpty) continue;
        const shape = cell.removeShape();
        shape.attachToCell(cell.bottomCell);
        res = true;
      }
    }
    return res;
  }

  hasSameType(cell1, cell2) {
    if (cell1.isEmpty || cell2.isEmpty) return false;
    return cell1.shape.constructor.name === cell2.shape.constructor.name;
  }

  markPop(i, j) {
    const cell = this.grid[i][j];
    if (cell.shouldPop !== void 0) return;

    cell.shouldPop = false;
    if (cell.isEmpty) return;

    let cnt = 1;

    let left = j;
    while (left - 1 >= 0 && this.hasSameType(cell, this.grid[i][left - 1])) {
      cnt++;
      left--;
    }

    let right = j;
    while (
      right + 1 < cols &&
      this.hasSameType(cell, this.grid[i][right + 1])
    ) {
      cnt++;
      right++;
    }

    if (cnt >= 3) {
      for (let c = left; c <= right; c++) {
        this.grid[i][c].shouldPop = true;
      }
    }

    cnt = 1;

    let top = i;
    while (top - 1 >= 0 && this.hasSameType(cell, this.grid[top - 1][j])) {
      cnt++;
      top--;
    }

    let bottom = i;
    while (
      bottom + 1 < rows &&
      this.hasSameType(cell, this.grid[bottom + 1][j])
    ) {
      cnt++;
      bottom++;
    }

    if (cnt >= 3) {
      for (let r = top; r <= bottom; r++) {
        this.grid[r][j].shouldPop = true;
      }
    }
  }

  isFull() {
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        if (cell.isEmpty) return false;
      }
    }
    return true;
  }

  popShapes() {
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        cell.shouldPop = undefined;
      }
    }
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        this.markPop(i, j);
      }
    }
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        if (cell.shouldPop) cell.removeShape();
      }
    }
  }

  findCell(x, y) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = this.grid[i][j];
        if (cell.contains(x, y)) return cell;
      }
    }
  }

  swapStart(mouseX, mouseY) {
    if (this.state !== STATE_STABLE) return;
    const cell = this.findCell(mouseX, mouseY);
    if (!cell) return;
    cell.highlight = true;
    this.swaps = [cell];
    this.state = STATE_SWAPPING;
  }

  isNeighborCell(cell1, cell2) {
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
    const cell0 = this.swaps[0];
    if (!cell || cell === cell0) return;
    if (!this.isNeighborCell(cell, cell0)) return;

    if (this.swaps.length === 2) {
      this.swaps[1].highlight = false;
      this.swaps.pop();
    }
    cell.highlight = true;
    this.swaps.push(cell);
  }

  swap() {
    if (this.state !== STATE_SWAPPING) return;
    if (this.swaps.length !== 2) {
      this.clearSwaps();
      this.state = STATE_STABLE;
      return;
    }

    const [cell1, cell2] = this.swaps;
    cell1.highlight = false;
    cell2.highlight = false;
    this.state = STATE_TRYING_SWAP;
  }

  doSwap() {
    const [cell1, cell2] = this.swaps;
    const shape1 = cell1.removeShape();
    const shape2 = cell2.removeShape();
    shape1.attachToCell(cell2);
    shape2.attachToCell(cell1);
  }

  clearSwaps() {
    while (this.swaps.length > 0) {
      const cell = this.swaps.pop();
      cell.highlight = false;
    }
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
      this.state = STATE_SWAPPED_POPING;
    } else if (this.state === STATE_SWAPPED_POPING) {
      this.popShapes();
      if (this.isFull()) {
        this.doSwap();
        this.state = STATE_STABLE;
      } else {
        this.state = STATE_POPING;
      }
      this.clearSwaps();
    }
  }

  show() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].show();
      }
    }
  }
}
