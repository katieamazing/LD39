(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

// A generic euclidean distance function, between two objects which have
// x and y properties.
function dist(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// A generic rectangle against rectangle collision check, between any two
// objects which have x, y, width, and height properties.
function colCheck(a, b){
  return !(b.x > a.x + a.width) && !(a.x > b.x + b.width) && !(b.y > a.y + a.height) && !(a.y > b.y + b.height);
}

class Ingredient {
  constructor (x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(){
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  action(){
    if (player.holding == null) {
      player.holding = this;
    } else if (player.holding == this) {
      player.holding = null;
    }
  }

  move(){ //move with player
    this.x = player.x;
    this.y = player.y;
  }
}

// A transitiondevice acts like a two-way door between two adjacent states
// for example, the launch thrusters are used to get from planets to space,
// and from space to planets, while the warp drive is used to get from space
// to the wine cellar and from the wine cellar to space.
class TransitionDevice {
  constructor (x, y, width, height, color, destination1, destination2) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.destination1 = destination1;
    this.destination2 = destination2;
  }

  draw() {
    ctx.save();
    if (currentState != this.destination1
      && currentState != this.destination2) {
        // unusable in this space, so fade out a little.
        ctx.globalAlpha = 0.4;
    }
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  action() {
    if (currentState == this.destination1) {
      transitionToState(this.destination2);
    } else if (currentState == this.destination2) {
      transitionToState(this.destination1);
    } else {
      // TODO(johnicholas): some sort of failure!
    }
  }
}

class Space {
  constructor(seed) {
    // TODO(johnicholas): Use the seed to place the sun and several planets?
    // build the background table using this seed TODO
    this.bg = [];
    for (var row = 0; row < canvas.height/T; row++) {
      let y = row * 64;
      for (var col = 0; col < canvas.width/T; col++) {
        let x = col * 64;
        let argx = 0;
        if (Math.random() < 0.8) {
          Math.floor((Math.random()) * 10);
          argx = (Math.floor((Math.random() * 12)) * 64);
        }
        this.bg.push([argx, x, y]);
      }
    }
    console.log(this.bg);
    this.ship = {x: canvas.width * 0.8, y: canvas.height * 0.8};
    // stuff that is native to space, like the sun, planets, and wormholes.
    // This stuff is never gonna go from space to the wine cellar or a planet.
    this.native_space_stuff =
      [ new TransitionDevice(100, 200, 10, 10, "#ff0000", "Planet", "Space")
      , new TransitionDevice(300, 400, 10, 10, "#00ff00", "Space", "WineCellar")
      ]
    this.stuff = [];
  }

  update() {
    // check keys
    let dx = 0
    let dy = 0
    if (keys[39] || keys[68]) {
      dx += 4;
    }
    if (keys[37] || keys[65]) {
      dx -= 4;
    }
    if (keys[38] || keys[87]) {
      dy -= 4;
    }
    if (keys[40] || keys[83]) {
      dy += 4;
    }
    this.ship.x += dx;
    this.ship.y += dy;
    for (var i = 0; i < this.stuff.length; i++) {
      this.stuff[i].x += dx;
      this.stuff[i].y += dy;
    }
    player.x = this.ship.x;
    player.y = this.ship.y;
  }

  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();

    // draw sparkly space bits
    for (var img = 0; img < this.bg.length; img++) {
      ctx.drawImage(space_bg_tiles, this.bg[img][0], 0, T, T, this.bg[img][1], this.bg[img][2], T, T);
    }

    // draw native space stuff
    for (var i = 0; i < this.native_space_stuff.length; i++) {
      this.native_space_stuff[i].draw();
    }
    // draw ship (radius)
    ctx.beginPath();
    ctx.arc(this.ship.x, this.ship.y, 200, 0, 2*Math.PI);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    //TODO
    //let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    //svgElement.setAttribute('transform', 'translate(' + this.ship.x + ', ' + this.ship.y + ') rotate(' + 0 + ')' );
    //svgElement.setAttribute('href', href);
    //document.querySelector('#canvas').appendChild(svgElement);

    // draw stuff
    for (var i = 0; i < this.stuff.length; i++) {
      this.stuff[i].draw();
    }
  }

  action() {
    for (var i = 0; i < this.native_space_stuff.length; i++) {
      // TODO(johnicholas): move the ship radius up and out
      if (dist(this.ship, this.native_space_stuff[i]) < 200) {
        this.native_space_stuff[i].action();
        return;
      }
    }
  }

  getShipStuff() {
    var accumulator = [];
    for (var i = 0; i < this.stuff.length; i++) {
      // TODO(johnicholas): move the ship radius up and out
      if (dist(this.stuff[i], this.ship) < 200) {
        // we need to convert to ship-relative coordinates
        this.stuff[i].x -= this.ship.x;
        this.stuff[i].y -= this.ship.y;
        accumulator.push(this.stuff[i]);
      }
    }
    // Clear space's stuff
    this.stuff = [];
    return accumulator;
  }

  addShipStuff(stuff_to_add) {
    for (var i = 0; i < stuff_to_add.length; i++) {
      // we need to convert from ship-relative coordinates
      stuff_to_add[i].x += this.ship.x;
      stuff_to_add[i].y += this.ship.y;
      this.stuff.push(stuff_to_add[i]);
    }
  }
}

class WineCellar {
  constructor() {
    this.ship = {x: 600, y: 400};
    this.native_hyperspace_stuff = [];
    this.stuff = [];
  }
  update() {
    if (keys[39] || keys[68]) {
      player.x += 4;
    }
    if (keys[37] || keys[65]) {
      player.x -= 4;
    }
    if (keys[38] || keys[87]) {
      player.y -= 4;
    }
    if (keys[40] || keys[83]) {
      player.y += 4;
    }
    if (player.holding !== null) {
      player.holding.move();
    }
  }
  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();

    // draw sparkly space bits
    // TODO

    // draw wine room
    ctx.drawImage(wine_room, 200, 200);

    // draw stuff
    for (var i = 0; i < this.stuff.length; i++) {
      this.stuff[i].draw();
    }
    // draw ship (radius)
    ctx.beginPath();
    ctx.arc(this.ship.x, this.ship.y, 200, 0, 2*Math.PI);
    ctx.stroke();
  }
  action() {
    for (var i = 0; i < this.native_hyperspace_stuff.length; i++) {
      // TODO(johnicholas): move the ship radius up and out
      if (dist(this.ship, this.native_hyperspace_stuff[i]) < 200) {
        this.native_hyperspace_stuff[i].action();
        return;
      }
    }
    for (var i = 0; i < this.stuff.length; i++) {
      if (this.stuff[i] !== player && colCheck(player, this.stuff[i])) {
        this.stuff[i].action();
      }
    }
  }
  getShipStuff() {
    var accumulator = [];
    for (var i = 0; i < this.stuff.length; i++) {
      // TODO(johnicholas): move the ship radius up and out
      if (dist(this.stuff[i], this.ship) < 200) {
        // we need to convert to ship-relative coordinates
        this.stuff[i].x -= this.ship.x;
        this.stuff[i].y -= this.ship.y;
        accumulator.push(this.stuff[i]);
      }
    }
    return accumulator;
  }
  addShipStuff(stuff_to_add) {
    for (var i = 0; i < stuff_to_add.length; i++) {
      // we need to convert from ship-relative coordinates
      stuff_to_add[i].x += this.ship.x;
      stuff_to_add[i].y += this.ship.y;
      this.stuff.push(stuff_to_add[i]);
    }
  }

  sendWine(player, wine, shelf_number){
    var payload = {
      "player": player,
      "wine": wine,
      "shelf_number": shelf_number
    };
    var data = new FormData();
    data.append( "player", player);
    data.append( "wine", wine);
    data.append( "shelf_number", JSON.stringify( shelf_number ) );

    fetch("https://ktld39.webscript.io/add_wine",
    { method: "POST", body: data })
    .then(function(res){
      return res.json();
    })
    .then(function(data){
      console.log(JSON.stringify(data));
    })
  }

  viewWine(shelf_number){
    fetch("https://ktld39.webscript.io/get_list").then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data);
      // TODO: display data[shelf_number] to user
    });
  }
}

class Planet {
  constructor(seed) {
    this.world =
      { width: 3 * canvas.width
      , height: 3 * canvas.height
      }
    this.typeMap = makeTypeMap(this.world);
    this.viewMap = makeViewMap(this.world, this.typeMap);
    this.viewport =
      { x: canvas.width
      , y: canvas.height
      };
    this.ship = {
      x: canvas.width * 1.5,
      y: canvas.height * 1.5
    }
    this.stuff =
      [ new Ingredient(1070, 1300, 10, 10, "#ff00ff")
      , new Ingredient(1340, 1500, 20, 15, "#ff0080")
      , new Ingredient(1700, 1017, 10, 5, "#0000ff")
      ]
  }
  update() {
    if (keys[39] || keys[68]) {
      player.x += 4;
    }
    if (keys[37] || keys[65]) {
      player.x -= 4;
    }
    if (keys[38] || keys[87]) {
      player.y -= 4;
    }
    if (keys[40] || keys[83]) {
      player.y += 4;
    }
    if (player.holding !== null) {
      player.holding.move();
    }
    var new_viewport_x;
    var new_viewport_y;
    if (player.x < this.viewport.x + canvas.width / 3.0) {
      new_viewport_x = player.x - canvas.width / 3.0;
    }
    if (player.x > this.viewport.x + canvas.width * 2.0 / 3.0) {
      new_viewport_x = player.x - canvas.width * 2.0 / 3.0;
    }
    if (player.y < this.viewport.y + canvas.height / 3.0) {
      new_viewport_y = player.y - canvas.height / 3.0;
    }
    if (player.y > this.viewport.y + canvas.height * 2.0 / 3.0) {
      new_viewport_y = player.y - canvas.height * 2.0 / 3.0
    }
    if (new_viewport_x > 0 && new_viewport_x < this.world.width - canvas.width) {
      this.viewport.x = new_viewport_x;
    }
    if (new_viewport_y > 0 && new_viewport_y < this.world.height - canvas.height) {
      this.viewport.y = new_viewport_y;
    }
  }
  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "grey";
    ctx.fill();

    ctx.save();
    ctx.translate(-1 * this.viewport.x, -1 * this.viewport.y);

    // draw terrain
    // TODO(johnicholas): draw less, not all this can be seen
    for (var row = 0; row < this.world.height/T; row++) {
      for (var col = 0; col < this.world.width/T; col++) {
        if (this.viewMap[row][col] == 'hole') {
          ctx.drawImage(terrain_hole, col*T, row*T)
        } else if (this.viewMap[row][col] == 'ceiling') {
          ctx.drawImage(terrain_ceiling, col*T, row*T)
        } else if (this.viewMap[row][col] == 'wall') {
          // TODO(johnicholas): add an image to draw a wall
          ctx.drawImage(terrain_ceiling, col*T, row*T)
        } else if (this.viewMap[row][col] == 'floor') {
          // ctx.drawImage(terrain_floor, col*T, row*T);
        } else if (typeof this.viewMap[row][col] == 'number') {
          // viewMap[row][col] is a number, pointing to a location in terrain_sheet1.
          let spritesheet_index = this.viewMap[row][col];
          ctx.drawImage(terrain_sheet1, spritesheet_index*T, 0, T, T, col*T, row*T, T, T);
        } else {
          // viewMap[row][col] is a pair of numbers, pointing to a location in terrain_sheet2.
          let row_in_sheet = this.viewMap[row][col].row;
          let col_in_sheet = this.viewMap[row][col].col;
          // ctx.drawImage(template_terrain_sheet, col_in_sheet*32, row_in_sheet*32, 32, 32, col*T, row*T, T, T);
          ctx.drawImage(terrain_sheet2, col_in_sheet*T, row_in_sheet*T, T, T, col*T, row*T, T, T);
        }
      }
    }
    // draw stuff
    for (var i = 0; i < this.stuff.length; i++) {
      this.stuff[i].draw();
    }
    // make sure to draw the thing the player is holding after the player,
    // so that it overlaps
    if (player.holding) {
      player.holding.draw();
    }
    // draw ship (radius)
    ctx.beginPath();
    ctx.arc(canvas.width * 1.5, canvas.height * 1.5, 200, 0, 2*Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  action() {
    for (var i = 0; i < this.stuff.length; i++) {
      if (this.stuff[i] !== player && colCheck(player, this.stuff[i])) {
        this.stuff[i].action();
      }
    }
  }
  getShipStuff() {
    var accumulator = [];
    for (var i = 0; i < this.stuff.length; i++) {
      // TODO(johnicholas): move the ship radius up and out
      if (dist(this.stuff[i], this.ship) < 200) {
        // we need to convert to ship-relative coordinates
        this.stuff[i].x -= this.ship.x;
        this.stuff[i].y -= this.ship.y;
        accumulator.push(this.stuff[i]);
      }
    }
    return accumulator;
  }
  addShipStuff(stuff_to_add) {
    for (var i = 0; i < stuff_to_add.length; i++) {
      // we need to convert from ship-relative coordinates
      stuff_to_add[i].x += this.ship.x;
      stuff_to_add[i].y += this.ship.y;
      this.stuff.push(stuff_to_add[i]);
    }
  }

}

// GLOBALS GLOBALS GLOBALS
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const T = 64; //tile size
canvas.width = 18*T;
canvas.height = 12*T;
let states =
  { Space: new Space
  , WineCellar: new WineCellar
  , Planet: new Planet
  }
let currentState = "Space";
let keys = [];
let player = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
  holding: null,
}
player.draw = function () {
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = "white";
  ctx.fill();
};
states[currentState].addShipStuff([player]);
(function () {
  let launch_thruster =
    new TransitionDevice(-100, 0, 10, 10, "#ff0000", "Planet", "Space");
  console.log(typeof launch_thruster.action);
  let warp_drive =
    new TransitionDevice(100, 0, 10, 10, "#00ff00", "Space", "WineCellar")
  states[currentState].addShipStuff([player, launch_thruster, warp_drive]);
}());
// END GLOBALS GLOBALS GLOBALS

function transitionToState(destinationState) {
  states[destinationState].addShipStuff(states[currentState].getShipStuff())
  currentState = destinationState;
}

function update() {
  states[currentState].update()
  states[currentState].draw();
  requestAnimationFrame(update);
}

document.body.addEventListener("keydown", function (e) {
  e.preventDefault();
    keys[e.keyCode] = true;
    if (e.keyCode == 32) {
      states[currentState].action();
    }
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
  update();
});
