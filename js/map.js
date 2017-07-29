let rules = {
  floor: [],
  hole: [
    { tileIndex:  0, map: { n: "!hole", e: "!hole", s: "!hole", w: "!hole"} },
    { tileIndex:  1, map: { n:  "hole", e: "!hole", s: "!hole", w: "!hole"} },
    { tileIndex:  2, map: { n: "!hole", e:  "hole", s: "!hole", w: "!hole"} },
    { tileIndex:  3, map: { n:  "hole", e:  "hole", s: "!hole", w: "!hole"} },
    { tileIndex:  4, map: { n: "!hole", e: "!hole", s:  "hole", w: "!hole"} },
    { tileIndex:  5, map: { n:  "hole", e: "!hole", s:  "hole", w: "!hole"} },
    { tileIndex:  6, map: { n: "!hole", e:  "hole", s:  "hole", w: "!hole"} },
    { tileIndex:  7, map: { n:  "hole", e:  "hole", s:  "hole", w: "!hole"} },
    { tileIndex:  8, map: { n: "!hole", e: "!hole", s: "!hole", w:  "hole"} },
    { tileIndex:  9, map: { n:  "hole", e: "!hole", s: "!hole", w:  "hole"} },
    { tileIndex: 10, map: { n: "!hole", e:  "hole", s: "!hole", w:  "hole"} },
    { tileIndex: 11, map: { n:  "hole", e:  "hole", s: "!hole", w:  "hole"} },
    { tileIndex: 12, map: { n: "!hole", e: "!hole", s:  "hole", w:  "hole"} },
    { tileIndex: 13, map: { n:  "hole", e: "!hole", s:  "hole", w:  "hole"} },
    { tileIndex: 14, map: { n: "!hole", e:  "hole", s:  "hole", w:  "hole"} },
    { tileIndex: 15, map: { n:  "hole", e:  "hole", s:  "hole", w:  "hole"} },
  ],
  ceiling: [
    // Put this rule up top to make clearing screen faster.
    { tileIndex: {row:4, col:1}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },

    // --- Row 1 ---
    { tileIndex: {row:1, col:0}, map: { nw:"!ceiling", n:"!ceiling", ne:"!ceiling", w:"!ceiling", e:"!ceiling", s:"ceiling"} },
    { tileIndex: {row:1, col:1}, map: { n:"!ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:0, col:4}, map: { n:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:0, col:6}, map: { n:"!ceiling", w:"ceiling", e:"!ceiling", sw:"ceiling", s:"ceiling" } },
    { tileIndex: {row:4, col:3}, map: { n:"!ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:0, col:2}, map: { n:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:0, col:6}, map: { n:"!ceiling", w:"ceiling", e:"!ceiling", sw:"!ceiling", s:"ceiling" } },
    { tileIndex: {row:2, col:5}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"!ceiling"} },
    { tileIndex: {row:3, col:4}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"!ceiling"} },
    { tileIndex: {row:5, col:1}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"ceiling"} },

    // --- Row 2 ---
    { tileIndex: {row:4, col:5}, map: { n:"ceiling", w:"!ceiling", e:"!ceiling", s:"ceiling" } },
    { tileIndex: {row:4, col:0}, map: { n:"ceiling", ne:"ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"ceiling" } },
    //{ tileIndex: {row:4, col:1}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:4, col:2}, map: { nw:"ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", sw:"ceiling", s:"ceiling" } },
    { tileIndex: {row:2, col:0}, map: { n:"ceiling", ne:"!ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"!ceiling" } },
    //{ tileIndex: ??, map: { nw:"!ceiling", n:"!ceiling", ne:"!ceiling", w:"!ceiling", e:"!ceiling", sw:"!ceiling", s:"!ceiling", se:"!ceiling" } },
    { tileIndex: {row:3, col:6}, map: { nw:"!ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", sw:"!ceiling", s:"ceiling" } },
    { tileIndex: {row:5, col:2}, map: { nw:"ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:5, col:3}, map: { nw:"!ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:1, col:3}, map: { nw:"!ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"ceiling" } },

    // --- Row 3 ---
    { tileIndex: {row:4, col:6}, map: { n:"ceiling", w:"!ceiling", e:"!ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:5}, map: { n:"ceiling", ne:"ceiling", w:"!ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:3, col:3}, map: { nw:"ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:6}, map: { nw:"ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:0}, map: { n:"ceiling", ne:"!ceiling", w:"!ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:3}, map: { nw:"!ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:4, col:4}, map: { nw:"!ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", s:"!ceiling" } },
    { tileIndex: {row:1, col:5}, map: { nw:"ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:3, col:1}, map: { nw:"!ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:2, col:3}, map: { nw:"!ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"ceiling" } },

    // --- Row 4 ---
    { tileIndex: {row:0, col:1}, map: { n:"!ceiling", w:"!ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:5, col:4}, map: { n:"!ceiling", w:"ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:4}, map: { n:"!ceiling", w:"ceiling", e:"!ceiling", s:"!ceiling" } },
    { tileIndex: {row:0, col:5}, map: { n:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:2, col:6}, map: { nw:"ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", sw:"!ceiling", s:"ceiling" } },
    { tileIndex: {row:5, col:0}, map: { n:"ceiling", ne:"ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:0, col:2}, map: { n:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:3, col:5}, map: { nw:"ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:2, col:1}, map: { nw:"!ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"!ceiling" } },

    // --- Row 5 ---
    { tileIndex: {row:2, col:2}, map: { nw:"ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:3, col:2}, map: { nw:"!ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:3, col:0}, map: { n:"ceiling", ne:"!ceiling", w:"!ceiling", e:"ceiling", s:"ceiling", se:"ceiling" } },
    { tileIndex: {row:6, col:1}, map: { nw:"!ceiling", n:"ceiling", ne:"ceiling", w:"ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:6, col:2}, map: { nw:"ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", s:"!ceiling" } },
    { tileIndex: {row:1, col:6}, map: { nw:"!ceiling", n:"ceiling", w:"ceiling", e:"!ceiling", sw:"ceiling", s:"ceiling" } },
    { tileIndex: {row:1, col:2}, map: { nw:"!ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"ceiling", s:"ceiling", se:"!ceiling" } },
    { tileIndex: {row:5, col:5}, map: { nw:"!ceiling", n:"ceiling", ne:"!ceiling", w:"ceiling", e:"ceiling", sw:"!ceiling", s:"ceiling", se:"ceiling" } },
  ],
  wall: []
};
