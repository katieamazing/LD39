
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const T = 64; //tile size
canvas.width = 18*T;
canvas.height = 12*T;

let keys = [];
let typeMap = [];
let viewMap = [];
let player = {
  x: 20,
  y: 20,
  width: 20,
  height: 20,
  holding: null
}

let stuff =
  [ { x: 70, y: 300, width: 10, height: 10, color:"#ff00ff" }
  , { x: 400, y: 500, width: 10, height: 10, color:"#ff0080" }
  , { x: 760, y: 17, width: 10, height: 10, color:"#0000ff" }
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

// TODO(johnicholas): make this return a value, instead of mutating a global
function makeTypeMap(){
  typeMap = [];
  for (var row = 0; row < canvas.height/T; row++) {
    typeMap[row] = [];
    for (var col = 0; col < canvas.width/T; col++) {
      let index = Math.floor((Math.random()) * 3);
      let type = null;
      if (index == 0) {
        type = 'floor';
      } else if (index == 1) {
        type = 'hole';
      } else {
        type = 'ceiling';
      }
      typeMap[row][col] = type;
    }
  }
  // in a second pass, we change the 'ceiling' tiles that are north of
  // non-ceiling tiles to be 'wall' tiles.
  /*
  for (var row = 0; row < canvas.height/T; row++) {
    for (var col = 0; col < canvas.width/T; col++) {
      if (typeMap[row][col] == 'ceiling'
        && typeMap[row+1] != undefined
        && typeMap[row+1][col] != 'ceiling') {
          typeMap[row][col] = 'wall';
      }
    }
  }
  */
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
  for (var row = 0; row < canvas.height/T; row++) {
    viewMap[row] = [];
    for (var col = 0; col < canvas.width/T; col++) {
      viewMap[row][col] = updateViewFromType(row, col);
    }
  }
}

function drawTerrain(){
  for (var row = 0; row < canvas.height/T; row++) {
    for (var col = 0; col < canvas.width/T; col++) {
      if (viewMap[row][col] == 'hole') {
        ctx.drawImage(terrain_hole, col*T, row*T)
      } else if (viewMap[row][col] == 'ceiling') {
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
        ctx.drawImage(terrain_sheet2, col_in_sheet*T, row_in_sheet*T, T, T, col*T, row*T, T, T);
      }
    }
  }
}

function drawStuff(stuff){
  for (var i = 0; i < stuff.length; i++) {
    ctx.beginPath();
    ctx.rect(stuff[i].x, stuff[i].y, 10, 10);
    ctx.fillStyle = stuff[i].color;
    ctx.fill();
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
    stuff[player.holding].x = player.x;
    stuff[player.holding].y = player.y;
  }
}

function drawPlayer(player){
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "white";
  ctx.fill();
}

function drawBackground(){
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white"; // TODO(johnicholas): put this back to "black"
  ctx.fill();
}

function colCheck(a, b){
  return !(b.x > a.x + a.width) && !(a.x > b.x + b.width) && !(b.y > a.y + a.height) && !(a.y > b.y + b.height);
}

function pickUp(){
  for (var i = 0; i < stuff.length; i++){
    if (colCheck(player, stuff[i])) {
      player.holding = i;
    }
  }
}

function dropOff(){
  player.holding = null;
}

function update() {
  //some logic updates


  //some input/keypress stuff
  movePlayer(player);

  //now draw it
  drawBackground();
  drawTerrain();
  drawPlayer(player);

  drawStuff(stuff);
  requestAnimationFrame(update);
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode == 32) {
      if (player.holding == null) {
        pickUp();
      } else {
        dropOff();
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
