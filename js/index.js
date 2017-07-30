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

// A generic circle against circle collision check, between any two objects
// which have x, y, and radius properties.
function circleColCheck(a, b) {
  return dist(a, b) < (a.radius + b.radius);
}

function randBetween(rng, floor, ceil) {
  return Math.floor(rng() * (ceil - floor)) + floor;
}
function generateColor(rng) {
  return "rgb(" + randBetween(rng, 20, 220) + ", " + randBetween(rng, 20, 220) + ", " + randBetween(rng, 20, 220) + ")";
}

class Ingredient {
  constructor (x, y, width, height, color, type, description) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
    this.description = description;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  action() {
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

// Wine acts just like any other ingredient?
// Except maybe it is drawn differently?
class Wine {
  constructor (x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = 4;
    this.description = 'strong';
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  action() {
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

// The wormhole acts like a one-way door between space and the hyperspatial
// wine cellar between the stars.
// It takes a destination function instead of a destination, so that we can
// avoid creating the destination state object until it is actually necessary.
class Wormhole {
  constructor (x, y, destination_fn) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.color = "green";
    this.radius = 10;
    this.destination_fn = destination_fn;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  action() {
    transitionToState(this.destination_fn())
  }
}

class WineMaker {
  constructor (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 100;
    this.color = "blue";
    this.ingredients = [];
    this.wine = null;
  }
  capacity() {
    if (this.wine === null) {
      return 3 - this.ingredients.length;
    } else {
      return 0;
    }
  }
  draw() {
    // draw machine
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = this.color;
    ctx.stroke();
    // draw ingredients OR
    // draw finished wine
  }
  combine_ingredients(first, second, third) {
    if (first.type == second.type
      && second.type == third.type) {
      // all equal
      return new Wine(-100, -100, 10, 10, "red");
    } else if (first.type != second.type
      && second.type != third.type
      && first.type != third.type) {
      // all different
      return new Wine(-100, -100, 10, 10, "blue");
    } else {
      // two and one
      return new Wine(-100, -100, 10, 10, "green");
    }
  }
  action() {
    if (player.holding === null && this.wine !== null) {
      console.log("Picking up wine!");
      currentState.stuff.push(this.wine);
      player.holding = this.wine;
      this.wine = null;
    } else if (player.holding === null && this.ingredients.length > 0) {
      console.log("Taking an ingredient out!");
      player.holding = this.ingredients.pop();
      currentState.stuff.push(player.holding);
    } else if (player.holding !== null && this.capacity() > 0) {
      console.log("Putting an ingredient in!");
      var index = currentState.stuff.indexOf(player.holding);
      if (index > -1) {
        currentState.stuff.splice(index, 1);
      }
      this.ingredients.push(player.holding);
      player.holding = null;
      if (this.capacity() == 0) {
        this.wine = this.combine_ingredients(
          this.ingredients[0],
          this.ingredients[1],
          this.ingredients[2]
        );
        this.ingredients = [];
      }
    }
  }
}

// The launch thruster is responsible for tracking fuel and launching the
// player into space.
class LaunchThruster {
  constructor (x, y) {
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 100;
    this.color = "red";
    this.fuel = 5;
  }

  draw() {
    for (var i = 0; i < this.fuel; i++) {
      ctx.beginPath();
      ctx.rect(this.x, this.y + this.height - (i+1) * this.height / 5, this.width, this.height / 6);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }

  action() {
    if (player.holding === null && this.fuel > 0 && currentState.space_state) {
      console.log("Launch!");
      this.fuel -= 1;
      transitionToState(currentState.space_state);
    } else if (player.holding !== null && this.fuel < 5) {
      console.log("Refuel!");
      this.fuel += 1;
      var index = currentState.stuff.indexOf(player.holding);
      if (index > -1) {
        currentState.stuff.splice(index, 1);
      }
      player.holding = null;
    }
  }
}



// A FloatingPlanet is visible in sspace, and is
// responsible for getting the player from space to one particular planet.
class FloatingPlanet {
  constructor (seed_string, x, y, r, space_state) {
    this.seed_string = seed_string;
    this.rng = new Math.seedrandom(seed_string);
    this.destination_planet = new Planet(seed_string + ",terrain", space_state);
    this.svg = mySVG.cloneNode(true);
    // TODO(johnicholas): improve this
    //this.svg.querySelector("#spaceDome path").style.fill = "rgb(" + Math.floor(this.rng() * 255) + ", " + Math.floor(this.rng() * 100) + ", 0)";
    let planet_types = ["a", "m", "n", "p", "s", "b"];
    let layer_1 = this.svg.querySelector("#e" + planet_types[Math.floor(this.rng() * planet_types.length)] + "_1");
    let layer_2 = this.svg.querySelector("#e" + planet_types[Math.floor(this.rng() * planet_types.length)] + "_2");

    this.svg.querySelector("#e_0 circle").style.fill = generateColor(this.rng);

    let layer_1Paths = layer_1.querySelectorAll("path");
    let layer_1PC = generateColor(this.rng);
    for (var i = 0; i < layer_1Paths.length; i++) {
      layer_1Paths[i].style.fill = layer_1PC;
    }

    let layer_2Paths = layer_2.querySelectorAll("path");
    let layer_2PC = generateColor(this.rng);
    for (var i = 0; i < layer_2Paths.length; i++) {
      layer_2Paths[i].style.fill = layer_2PC;
    }

    this.svg.querySelector("#e_0").setAttribute("transform", "scale(" + r/67 + ")");
    layer_1.setAttribute("transform", "scale(" + r/67 + ")");
    layer_2.setAttribute("transform", "scale(" + r/67 + ")");

    this.svg.querySelector("#e_0").style.display = "inline";
    layer_1.style.display = "inline";
    layer_2.style.display = "inline";

    var wrap = document.createElement("div");
    wrap.appendChild(this.svg);
    this.image = new Image();
    this.image.src = "data:image/svg+xml;base64," + window.btoa(wrap.innerHTML);
    this.x = x;
    this.y = y;
    this.radius = r;
  }

  draw() {
    ctx.drawImage(this.image, this.x - 100 * this.radius / 67, this.y - 133 * this.radius / 67);
  }
  action() {
    console.log("going down to ", this.seed_string);
    transitionToState(this.destination_planet);
  }


}

class Space {
  constructor(username, systems_seen) {
    this.seed_string = username + "," + systems_seen;
    this.rng = new Math.seedrandom(this.seed_string);
    this.bg = [];
    for (var row = 0; row < canvas.height/T; row++) {
      let y = row * 64;
      for (var col = 0; col < canvas.width/T; col++) {
        let x = col * 64;
        let argx = 0;
        if (this.rng() < 0.8) {
          argx = Math.floor(this.rng() * 12) * 64;
        }
        this.bg.push([argx, x, y]);
      }
    }
    this.ship = {x: canvas.width * 0.8, y: canvas.height * 0.8, radius: 200};
    // stuff that is native to space, like the sun, planets, and wormholes.
    // This stuff is never gonna go from space to the wine cellar or a planet.
    this.native_space_stuff = [
      new Wormhole(canvas.width * 0.8, canvas.height * 0.8,
        function () {
          return new WineCellar(username, systems_seen+1);
        })
    ];
    // Use the seed to create several planets
    var planet_count = randBetween(this.rng, 1, 6);
    for (var planet_index = 0; planet_index < planet_count; planet_index++) {
      var f = (planet_index+1)/(planet_count+1);
      let x = f*0 + (1-f)*canvas.width*0.7 + randBetween(this.rng, -50, 50);
      let y = f*canvas.height + (1-f) * 0 + randBetween(this.rng, -50, 50);
      let min_r = 50;
      let max_r = 200;
      let r = f*max_r + (1-f)*min_r;
      this.native_space_stuff.push(new FloatingPlanet(this.seed_string + "," + planet_index, x, y, r, this));
    }
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

    // TODO(johnicholas): draw ship for real
    ctx.beginPath();
    ctx.arc(this.ship.x, this.ship.y, 200, 0, 2*Math.PI);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // draw stuff
    for (var i = 0; i < this.stuff.length; i++) {
      this.stuff[i].draw();
    }

    // plane of the ecliptic
    //ctx.beginPath();
    //ctx.moveTo(0, canvas.height);
    //ctx.lineTo(canvas.width*0.7, 0);
    //ctx.strokeStyle = "white";
    //ctx.stroke();
  }

  action() {
    var best_so_far = Number.POSITIVE_INFINITY;
    var found = null;
    for (var i = 0; i < this.native_space_stuff.length; i++) {
      if (circleColCheck(this.ship, this.native_space_stuff[i])
        && dist(this.ship, this.native_space_stuff[i]) < best_so_far) {
        best_so_far = dist(this.ship, this.native_space_stuff[i]);
        found = i;
      }
    }
    if (found !== null) {
      this.native_space_stuff[found].action();
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
  constructor(username, systems_seen) {
    this.ship = {x: 650, y: 400};
    this.native_hyperspace_stuff = [
      new Wormhole(canvas.width * 0.6, canvas.height * 0.5,
        function () {
          return new Space(username, systems_seen);
        })
    ];
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
    for (var i = 0; i < this.native_hyperspace_stuff.length; i++) {
      this.native_hyperspace_stuff[i].draw();
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
    ctx.arc(this.ship.x, this.ship.y, 200, 0, 2*Math.PI);
    ctx.stroke();
  }
  action() {
    for (var i = 0; i < this.native_hyperspace_stuff.length; i++) {
      if (colCheck(player, this.native_hyperspace_stuff[i])) {
        this.native_hyperspace_stuff[i].action();
        return;
      }
    }
    var found = [];
    for (var i = 0; i < this.stuff.length; i++) {
      if (this.stuff[i] === player) {
        // player can't action itself, silly!
      } else if (this.stuff[i] === player.holding) {
        // de-prioritize this, so we can load things
      } else if (colCheck(player, this.stuff[i])) {
        found.push(i);
      }
    }
    if (found.length == 1) {
      this.stuff[found[0]].action();
    } else if (found.length > 0) {
      console.log("Which one?", found);
    } else if (player.holding) {
      // only if there is no other thing to do
      player.holding.action();
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
    // Clear hyperspace's stuff,
    // you can't leave stuff lying around in hyperspace
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

let descs = [
  ['incandescent', 'firey', 'psychogenic', 'levitating', 'liquid-metal'],
  ['warm', 'fuzzy', 'tart', 'tough', 'bright'],
  ['soft', 'curved', 'supple', 'sinuous', 'slimy'],
  ['fibrous', 'organic', 'woody', 'starchy', 'crystalline'],
  ['sweet', 'pungent', 'sour', 'tangy', 'strong'],
]

class Planet {
  constructor(seed_string, space_state) {
    this.seed_string = seed_string;
    this.space_state = space_state;
    this.rng = new Math.seedrandom(this.seed_string);
    this.world =
      { width: 3 * canvas.width
      , height: 3 * canvas.height
      }
    this.typeMap = makeTypeMap(this.world, this.rng);
    this.viewMap = makeViewMap(this.world, this.typeMap);
    this.viewport =
      { x: canvas.width
      , y: canvas.height
      };
    this.ship = {
      x: canvas.width * 1.5,
      y: canvas.height * 1.5
    }
    // we scatter random ingredients over the world
    this.common_ingredient_type = randBetween(this.rng, 2, 4);
    this.common_ingredient_desc =
      descs[this.common_ingredient_type][randBetween(this.rng, 0, descs[this.common_ingredient_type].length)];
      this.common_ingredient_color = generateColor(this.rng);
    this.rare_ingredient_type = randBetween(this.rng, 0, 5);
    this.rare_ingredient_desc =
      descs[this.rare_ingredient_type][randBetween(this.rng, 0, descs[this.rare_ingredient_type].length)];
    this.rare_ingredient_color = generateColor(this.rng);
    this.stuff = [];
    for (var i = 0; i < randBetween(this.rng, 16, 20); i += 1) {
      this.stuff.push(new Ingredient(
        randBetween(this.rng, 0, this.world.width),
        randBetween(this.rng, 0, this.world.height),
        10,
        10,
        this.common_ingredient_color,
        this.common_ingredient_desc
      ));
    }
    for (var i = 0; i < randBetween(this.rng, 2, 8); i += 1) {
      this.stuff.push(new Ingredient(
        randBetween(this.rng, 0, this.world.width),
        randBetween(this.rng, 0, this.world.height),
        10,
        10,
        this.rare_ingredient_color,
        this.rare_ingredient_desc
      ));
    }
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
    var found = [];
    for (var i = 0; i < this.stuff.length; i++) {
      if (this.stuff[i] === player) {
        // player can't action itself, silly!
      } else if (this.stuff[i] === player.holding) {
        // de-prioritize this, so we can load things
      } else if (colCheck(player, this.stuff[i])) {
        found.push(i);
      }
    }
    if (found.length == 1) {
      this.stuff[found[0]].action();
    } else if (found.length > 0) {
      console.log("Which one?", found);
    } else if (player.holding) {
      // only if there is no other thing to do
      player.holding.action();
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
    // remove all and only the things that are leaving
    for (var j = 0; j < accumulator.length; j++) {
      var index = this.stuff.indexOf(accumulator[j]);
      if (index > -1) {
        this.stuff.splice(index, 1);
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
let currentState = new Space("KT", 0);
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
(function () {
  let launch_thruster = new LaunchThruster(-100, 0);
  let wine_maker = new WineMaker(0, -100);
  currentState.addShipStuff([player, launch_thruster, wine_maker]);
}());
// END GLOBALS GLOBALS GLOBALS

function transitionToState(destinationState) {
  destinationState.addShipStuff(currentState.getShipStuff())
  currentState = destinationState;
}

function frame() {
  currentState.update()
  currentState.draw();
  requestAnimationFrame(frame);
}

document.body.addEventListener("keydown", function (e) {
  if (e.keyCode == 39
    || e.keyCode == 68
    || e.keyCode == 37
    || e.keyCode == 65
    || e.keyCode == 38
    || e.keyCode == 87
    || e.keyCode == 40
    || e.keyCode == 83
    || e.keyCode == 32) {
    e.preventDefault();
    keys[e.keyCode] = true;
    if (e.keyCode == 32) {
      currentState.action();
    }
  }
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
  frame();
});
