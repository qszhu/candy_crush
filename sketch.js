/*
形状
* [x] 三角形 黄色
* [x] 正方形 蓝色
* [x] 五角星 红色
* [x] 圆形 绿色

格子数
* [x] 起始 5x5

规则
* 拖动交换相邻形状
  * [x] 拖动时高亮
  * [x] 释放时交换
  * [x] 无法交换时恢复

消除
* 三个及以上排成一条可消除
* [x] 产生新的形状落入空档
* [x] 形状底部有空档时下落
* [x] 落满后消除

游戏结束
* [ ] 无法再消除时位置打乱

音效
* [ ] 消除
  * [ ] combo
* [ ] 下落
* [ ] 背景音乐

特效
* [ ] 动画
* [ ] blingbling
* [ ] 消除时爆炸粒子

*/

const rows = 5;
const cols = 5;

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
  createCanvas(600, 600);

  grid = new Grid(rows, cols);
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
