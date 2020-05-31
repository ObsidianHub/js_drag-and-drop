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

var shapes = [
  new Circle(100, 100, 20),
  new Polygon(100, 200, [0, -20, 20, 0, 20, 20, -20, 20, -20, 0]),
  new Polygon(100, 300, [-20, -20, 20, -20, 20, 20, -20, 20]),
  new Polygon(100, 400, [0, -20, 20, 20, -20, 20]),
];

var pointer = {
  x: 0,
  y: 0,
  down: false,
  getExtremePoint: function () {
    return [this.x, this.y];
  },
};

var selected_shape = undefined;

function drawShape(shape, c) {
  switch (shape.constructor) {
    case Circle:
      drawCircle(shape, c);
      break;
    case Polygon:
      drawPolygon(shape.vertices, c);
  }
}

function drawCircle(circle, c = "#0080f0") {
  context.beginPath();
  context.fillStyle = c;
  context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
  context.closePath();
  context.fill();
}

function drawPolygon(vertices, c = "#0080f0") {
  context.beginPath();
  context.fillStyle = c;
  context.moveTo(vertices[0], vertices[1]);

  for (let index = vertices.length - 1; index > 0; index -= 2) {
    context.lineTo(vertices[index - 1], vertices[index]);
  }

  context.closePath();
  context.fill();
}

function loop(time_stamp) {
  window.requestAnimationFrame(loop);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  if (pointer.down && selected_shape == undefined) {
    for (let index = shapes.length - 1; index > -1; --index) {
      let shape = shapes[index];

      if (shape.collide(pointer, [1, 0])) {
        selected_shape = shapes.splice(index, 1)[0];
        break;
      }
    }
  }

  let colliding = false;

  for (let index = shapes.length - 1; index > -1; --index) {
    let shape = shapes[index];

    if (selected_shape && selected_shape.collide(shape, [1, 0])) {
      drawShape(shape, "#f08000");
      colliding = true;
    } else {
      drawShape(shape, "#0080f0");
    }
  }

  if (selected_shape) {
    selected_shape.moveTo(pointer.x, pointer.y);
    if (colliding) drawShape(selected_shape, "#f08000");
    else drawShape(selected_shape, "#0080f0");
  }

  if (!pointer.down && selected_shape) {
    shapes.push(selected_shape);
    selected_shape = undefined;
  }
}

function mouseDownMoveUp(event) {
  var r = context.canvas.getBoundingClientRect();

  pointer.x = event.clientX - r.left;
  pointer.y = event.clientY - r.top;

  switch (event.type) {
    case "mousedown":
      pointer.down = true;
      break;
    case "mouseup":
      pointer.down = false;
  }
}

function resize(event) {
  context.canvas.height = document.documentElement.clientHeight - 16;
  context.canvas.width = document.documentElement.clientWidth - 16;
}
