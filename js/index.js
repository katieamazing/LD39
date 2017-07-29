
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

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
      currentState = this.destination2;
    } else if (currentState == this.destination2) {
      currentState = this.destination1;
    } else {
      // TODO(johnicholas): some sort of failure!
    }
  }
}

class Space {
  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, world.width, world.height);
    ctx.fillStyle = "black";
    ctx.fill();

    // draw sparkly space bits
    // TODO
  }
}

class WineCellar {

  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, world.width, world.height);
    ctx.fillStyle = "black";
    ctx.fill();

    // draw sparkly space bits
    // TODO

    // draw wine room
    ctx.drawImage(wine_room, 200, 200);
  }
}

class Planet {
  draw() {
    // draw background
    ctx.beginPath();
    ctx.rect(0, 0, world.width, world.height);
    ctx.fillStyle = "grey";
    ctx.fill();

    // draw terrain
    // TODO(johnicholas): draw less, not all this can be seen
    for (var row = 0; row < world.height/T; row++) {
      for (var col = 0; col < world.width/T; col++) {
        if (viewMap[row][col] == 'hole') {
          ctx.drawImage(terrain_hole, col*T, row*T)
        } else if (viewMap[row][col] == 'ceiling') {
          ctx.drawImage(terrain_ceiling, col*T, row*T)
        } else if (viewMap[row][col] == 'wall') {
          // TODO(johnicholas): add an image to draw a wall
          ctx.drawImage(terrain_ceiling, col*T, row*T)
        } else if (viewMap[row][col] == 'floor') {
          // ctx.drawImage(terrain_floor, col*T, row*T);
        } else if (typeof viewMap[row][col] == 'number') {
          // viewMap[row][col] is a number, pointing to a location in terrain_sheet1.
          let spritesheet_index = viewMap[row][col];
          ctx.drawImage(terrain_sheet1, spritesheet_index*T, 0, T, T, col*T, row*T, T, T);
        } else {
          // viewMap[row][col] is a pair of numbers, pointing to a location in terrain_sheet2.
          let row_in_sheet = viewMap[row][col].row;
          let col_in_sheet = viewMap[row][col].col;
          // ctx.drawImage(template_terrain_sheet, col_in_sheet*32, row_in_sheet*32, 32, 32, col*T, row*T, T, T);
          ctx.drawImage(terrain_sheet2, col_in_sheet*T, row_in_sheet*T, T, T, col*T, row*T, T, T);
        }
      }
    }
  }

}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const T = 64; //tile size
canvas.width = 18*T;
canvas.height = 12*T;
let world =
  { width: 3 * canvas.width
  , height: 3 * canvas.height
  }

let states =
  { Space: new Space
  , WineCellar: new WineCellar
  , Planet: new Planet
  }

let currentState = "Planet";
let keys = [];
let typeMap = [];
let viewMap = [];
let viewport = {
  x: 1000,
  y: 1000
};
let player = {
  x: 1020,
  y: 1020,
  width: 20,
  height: 20,
  holding: null
}

let stuff =
  [ new Ingredient(1070, 1300, 10, 10, "#ff00ff")
  , new Ingredient(1340, 1500, 20, 15, "#ff0080")
  , new Ingredient(1700, 1017, 10, 5, "#0000ff")
  , new TransitionDevice(1100, 1100, 10, 10, "#ff0000", "Planet", "Space")
  , new TransitionDevice(1200, 1100, 10, 10, "#00ff00", "Space", "WineCellar")
  ]

function sendWine(player, wine, shelf_number){
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

function viewWine(shelf_number){
  fetch("https://ktld39.webscript.io/get_list").then(function(response) {
    return response.json();
  }).then(function(data) {
    console.log(data);
    // TODO: display data[shelf_number] to user
  });
}

function transitionToState(destinationState) {
  currentState = destinationState;
}

// TODO(johnicholas): make this return a value, instead of mutating a global
function makeTypeMap(){
  typeMap = [];
  for (var row = 0; row < world.height/T; row++) {
    typeMap[row] = [];
    for (var col = 0; col < world.width/T; col++) {
      // TODO(johnicholas): change this back to 3, this is "lots of ceiling" testing.
      let index = Math.floor((Math.random()) * 10);
      let type = null;
      switch (Math.floor((Math.random()) * 10)) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          type = 'ceiling';
          break;
        case 5:
        case 6:
        case 7:
          type = 'floor';
          break;
        case 8:
        case 9:
          type = 'hole';
          break;
      }
      typeMap[row][col] = type;
    }
  }
  // in a second pass, we change the 'ceiling' tiles that are north of
  // non-ceiling tiles to be 'wall' tiles.
  for (var row = 0; row < world.height/T; row++) {
    for (var col = 0; col < world.width/T; col++) {
      if (typeMap[row][col] == 'ceiling'
        && typeMap[row+1] != undefined
        && typeMap[row+1][col] != 'ceiling') {
          typeMap[row][col] = 'wall';
          console.log(row, col);
      }
    }
  }
}

function checkType(row, col, ruleTypeStr, baseType) {
  var type = null;
  if (typeMap[row] == undefined || typeMap[row][col] == undefined) {
    // if we look beyond the edge of the map, we find a copy of the center cell
    type = baseType;
  } else {
    type = typeMap[row][col];
  }
  if (ruleTypeStr == undefined) {
    return true;
  }
  if (ruleTypeStr.charAt(0) == "!") {
    return type != ruleTypeStr.slice(1);
  } else {
    return type == ruleTypeStr;
  }
}

function checkRule(rule, row, col) {
  var base = typeMap[row][col];

  if( !checkType( row-1, col-1, rule.map.nw, base ) ) return false;
  if( !checkType( row-1, col,   rule.map.n,  base ) ) return false;
  if( !checkType( row-1, col+1, rule.map.ne, base ) ) return false;
  if( !checkType( row,   col-1, rule.map.w,  base ) ) return false;
  if( !checkType( row,   col+1, rule.map.e,  base ) ) return false;
  if( !checkType( row+1, col-1, rule.map.sw, base ) ) return false;
  if( !checkType( row+1, col,   rule.map.s,  base ) ) return false;
  if( !checkType( row+1, col+1, rule.map.se, base ) ) return false;

  return true;
}

function updateViewFromType(row, col) {
  var type = typeMap[row][col];
  for (var i = 0; i < rules[type].length; i++) {
    var rule = rules[type][i];
    if (checkRule(rule, row, col)) {
      return rule.tileIndex;
    }
  }
  console.log(row, col);
  return typeMap[row][col];
}

// TODO(johnicholas): make this return a value, instead of mutating a global
function makeViewMap() {
  for (var row = 0; row < world.height/T; row++) {
    viewMap[row] = [];
    for (var col = 0; col < world.width/T; col++) {
      viewMap[row][col] = updateViewFromType(row, col);
    }
  }
}

function drawStuff(stuff){
  for (var i = 0; i < stuff.length; i++) {
    stuff[i].draw();
  }
};

function movePlayer(player){
  // check keys
  if (keys[39] || keys[68]) {
      // right arrow
    player.x += 4;
  }
  if (keys[37] || keys[65]) {
      // left arrow
    player.x -= 4;
  }
  if (keys[38] || keys[87]) {
      // up arrow or space
    player.y -= 4;
  }
  if (keys[40] || keys[83]) {
    player.y += 4;
  }

  if (player.holding !== null){
    player.holding.move();
  }
  var new_viewport_x;
  var new_viewport_y;
  if (player.x < viewport.x + canvas.width / 3.0) {
    new_viewport_x = player.x - canvas.width / 3.0;
  }
  if (player.x > viewport.x + canvas.width * 2.0 / 3.0) {
    new_viewport_x = player.x - canvas.width * 2.0 / 3.0;
  }
  if (player.y < viewport.y + canvas.height / 3.0) {
    new_viewport_y = player.y - canvas.height / 3.0;
  }
  if (player.y > viewport.y + canvas.height * 2.0 / 3.0) {
    new_viewport_y = player.y - canvas.height * 2.0 / 3.0
  }
  if (new_viewport_x > 0 && new_viewport_x < world.width - canvas.width) {
    viewport.x = new_viewport_x;
  }
  if (new_viewport_y > 0 && new_viewport_y < world.height - canvas.height) {
    viewport.y = new_viewport_y;
  }
}

function drawPlayer(player){
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "white";
  ctx.fill();
}

function drawBackground(color){
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fill();
}

function colCheck(a, b){
  return !(b.x > a.x + a.width) && !(a.x > b.x + b.width) && !(b.y > a.y + a.height) && !(a.y > b.y + b.height);
}

function update() {
  //some logic updates


  //some input/keypress stuff
  movePlayer(player);

  //now draw it

  ctx.save();
  ctx.translate(-1 * viewport.x, -1 * viewport.y);
  states[currentState].draw();
  drawPlayer(player);
  drawStuff(stuff);
  ctx.restore();
  requestAnimationFrame(update);
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode == 32) {
      for (var i = 0; i < stuff.length; i++){
        if (colCheck(player, stuff[i])) {
          stuff[i].action();
        }
      }
    }
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
  makeTypeMap();
  makeViewMap();
  update();
});
