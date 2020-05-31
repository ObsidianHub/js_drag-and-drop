var o = document.querySelector("p");

class ConvexShape2D {
  constructor() {}

  collide(shape, d) {
    var a = this.getExtremePoint(d[0], d[1]); // get the extreme point on this shape
    var b = shape.getExtremePoint(-d[0], -d[1]); // get the opposite extreme point on the other shape
    var p = [a[0] - b[0], a[1] - b[1]]; // get the extreme point on the Minkowski Difference shape
  }
}
