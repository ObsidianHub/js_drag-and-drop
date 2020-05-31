var o = document.querySelector("p");

class ConvexShape2D {
  constructor() {}

  collide(shape, d) {
    var a = this.getExtremePoint(d[0], d[1]); // get the extreme point on this shape
    var b = shape.getExtremePoint(-d[0], -d[1]); // get the opposite extreme point on the other shape
    var p = [a[0] - b[0], a[1] - b[1]]; // get the extreme point on the Minkowski Difference shape

    if (p[0] * d[0] + p[1] * d[1] < 0) return false; // if the origin is beyond p in direction d, return false

    var c = false; // cross product / simplex winding place holder; it doesn't matter how this is initialized because it will be reset when the simplex length is about to be 2
    var s = [[p[0], p[1]]]; // the simplex now has one point in it

    d = [-p[0], -p[1]]; // search in the direction of the origin next

    while (true) {
      a = this.getExtremePoint(d[0], d[1]); // get the extreme point on this shape
      b = shape.getExtremePoint(-d[0], -d[1]); // get the opposite extreme point on the other shape
      p = [a[0] - b[0], a[1] - b[1]]; // get the extreme point on the Minkowski Difference shape

      if (p[0] * d[0] + p[1] * d[1] < 0) return false; // if the origin is beyond p in direction d, return false

      let tc = Boolean(s[0][0] * p[1] - s[0][1] * p[0] < 0); // the test cross product will be + / - depending on winding; It doesn't matter what the winding is so long as it is the same for every line segment in the simplex.
    }
  }
}
