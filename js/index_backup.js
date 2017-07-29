
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
let map = null;
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
  data.append( "json", JSON.stringify( payload ) );

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
    //display data[shelf_number] to user
  });
}

function makeMap(){
  let map = [];
  for (var row = 0; row < canvas.height/T; row++) {
    map[row] = [];
    for (var col = 0; col < canvas.width/T; col++) {
      map[row][col] = Math.floor((Math.random()) * 3);
    }
  }
  return map;
}

function drawTerrain(){
  for (var row = 0; row < canvas.height/T; row++) {
    for (var col = 0; col < canvas.width/T; col++) {
      if (map[row][col] == 0) {
        ctx.drawImage(terrain_hole, col*T, row*T)
      } else if (map[row][col] == 1) {
        ctx.drawImage(terrain_ceiling, col*T, row*T)
      } else {
        ctx.drawImage(terrain_floor, col*T, row*T);
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
  ctx.fillStyle = "black";
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
  map = makeMap();
  update();
});
