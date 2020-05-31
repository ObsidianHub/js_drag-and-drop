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

      if (s.length == 1) c = tc;
      // if there's only 1 point in the simplex, choose the current winding; this represents the winding of the first segment in the simplex
      else if (c == tc) {
        // if there is more than 1 point in the simplex and the winding is not changing with the addition of p (meaning that the winding is remaining the same for all segments in the simplex and the new segment)

        tc = Boolean(p[0] * s[1][1] - p[1] * s[1][0] < 0); // Now we do a cross check between the test point, p, and the start point of the simplex.

        if (c == tc) return true;
        // collision!
        else {
          // no collision and the winding has changed

          s.shift();
          tc = c;
        }
      } else {
        c = tc;
        s.pop();
      }

      if (tc) {
        d[0] = p[1] - s[0][1];
        d[1] = s[0][0] - p[0];
      } else {
        d[0] = s[0][1] - p[1];
        d[1] = p[0] - s[0][0];
      }

      s.unshift(p);
    }
  }

  getExtremePoint(vx, vy) {}

  moveTo() {}
}

class Circle extends ConvexShape2D {
  constructor(x, y, r) {
    super();

    this.x = x;
    this.y = y;
    this.r = r;
  }

  getExtremePoint(vx, vy) {
    var d = Math.atan2(vy, vx);

    vx = Math.cos(d) * this.r;
    vy = Math.sin(d) * this.r;

    return [this.x + vx, this.y + vy];
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Polygon extends ConvexShape2D {
  constructor(x, y, vertices) {
    super();

    this.x = this.y = 0;

    this.vertices = [...vertices];

    this.moveTo(x, y);
  }

  getExtremePoint(vx, vy) {
    var p = [this.vertices[0], this.vertices[1]];
    var ml = this.vertices[0] * vx + this.vertices[1] * vy;

    for (var index = this.vertices.length - 2; index > 1; index -= 2) {
      let tl = this.vertices[index] * vx + this.vertices[index + 1] * vy;

      if (tl > ml) {
        ml = tl;
        p = [this.vertices[index], this.vertices[index + 1]];
      }
    }

    return p;
  }

  moveTo(x, y) {
    var vx = x - this.x;
    var vy = y - this.y;

    for (let index = this.vertices.length - 1; index > 0; index -= 2) {
      this.vertices[index - 1] += vx;
      this.vertices[index] += vy;
    }

    this.x += vx;
    this.y += vy;
  }
}

var context = document
  .getElementById("canvas")
  .getContext("2d", { alpha: false });
