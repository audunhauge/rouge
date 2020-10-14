// @ts-check

import { roll } from "./util.js";
import { EasyStar } from "./Astar.js";

class T {
  static OCEAN = 1;
  static SEA = 2;
  static SHALLOWS = 3;
  static GRASS = 4;
  static PLAIN = 5;
  static SWAMP = 6;
  static FOREST = 7;
  static HILL = 8;
  static MOUNTAIN = 9;
  static ROAD = 32;       // any terrain can have a road
  static THING = 64;
  static MONSTER = 128;
}

const _walkCost = {};
_walkCost[T.OCEAN] = 100;
_walkCost[T.SEA] = 10;
_walkCost[T.SHALLOWS] = 5;
_walkCost[T.GRASS] = 1;
_walkCost[T.PLAIN] = 1.5;
_walkCost[T.FOREST] = 3;
_walkCost[T.HILL] = 5;
_walkCost[T.MOUNTAIN] = 10;
_walkCost[T.ROAD] = 0.8;


const theWalk = {
  get: function (obj, prop) {
    if (prop & T.ROAD) { return 0.8; }
    return obj[prop] ?? 1;
  },
};

const walkCost = new Proxy(_walkCost, theWalk);

const B = { w: 80, h: 80 };
const roads = [];

/**
 *
 * @param {Uint8ClampedArray} theMap
 * @param {number} w
 * @param {number} h
 * @param {number} _LAND
 * @param {number} _MINIMUM
 * @param {number} _RADIUS
 * @param {string} _FREQ
 */
function build(
  theMap,
  w,
  h,
  _LAND = 3,
  _MINIMUM = 4,
  _RADIUS = 8,
  _FREQ = "8877766655443"
) {
  // fill map with ocean
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      theMap[y * 80 + x] = T.OCEAN;
    }
  }

  // generate random number of islands
  // x,y is pos, r is radius
  const RADIUS = _RADIUS;
  const LAND = _LAND; //  1 = small islands  50 = large islands
  const MINIMUM = _MINIMUM; // 1 = few islands 10 = many islands
  const FREQ = _FREQ; // we pick from this list to choose terrain
  let size = w * w * h * h;
  let logSize = Math.floor(Math.log(size));
  let islandCount = MINIMUM + roll(Math.floor(logSize / 3 + 1), logSize + 1);
  let maxR = RADIUS + roll(3, 9);
  let minR = Math.max(1, RADIUS - roll(3, 9));
  // space the islands
  let m = Math.floor((w + h) / 2);
  let sqr = 3 + Math.floor(m / Math.sqrt(islandCount));
  let dx = -Math.floor(sqr / 1.7);
  let dy = Math.floor(sqr / 2.2);

  let islands = Array(islandCount)
    .fill(0)
    .map((e) => {
      dx += sqr;
      if (dx > w) {
        dx = sqr;
        dy += sqr;
        if (dy > h) {
          dy = h - Math.floor(sqr / 2);
        }
      }
      return { x: dx + roll(1, 5), y: dy + roll(1, 5), r: roll(minR, maxR) };
    });

  // remove islands of the map
  islands = islands.filter((e) => e.x < w && e.y < h);

  // place initial mountain at island seed
  islands.forEach((e) => {
    theMap[e.x + w * e.y] = T.MOUNTAIN;
  });

  // stand on each island and throw stones
  islands.forEach((e) => {
    let iter = Math.min(LAND * logSize, e.r * e.r);
    for (let i = 0; i < iter; i++) {
      let p = throwStone(e);
      let x = (p.x + w) % w;
      let y = (p.y + h) % h;
      if (theMap[x + w * y] === T.OCEAN) {
        // close to island === mountain
        // far away === grass
        let pos = Math.random() * FREQ.length;
        let t = +FREQ.charAt(pos);
        //let t = 3 + Math.floor(Math.random() * 9 * (1 - p.r / e.r));
        theMap[x + w * y] = Math.min(T.MOUNTAIN, t);
      }
    }
  });

  // create land around high ground (mountain -> hills -> forrest -> swamp -> grass)

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let e = theMap[x + y * w];
      if (e === T.OCEAN) {
        // check in 8 directions
        let adjacent = getNeighbours(x, y);
        let m = Math.max(...adjacent);
        if (adjacent.length > 1 && m > T.GRASS) {
          theMap[x + w * y] = m - 1; // roll(1, m - 1);
        }
      }
    }
  }

  if (islandCount < 12 && logSize > 8) {
    // do it twice to grow some more land
    // create land around high ground (mountain -> hills -> forrest -> swamp -> grass)
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let e = theMap[x + y * w];
        if (e === T.OCEAN) {
          // check in 6 directions
          let m = Math.max(...getNeighbours(x, y));
          if (m > T.GRASS) {
            theMap[x + w * y] = m - roll(1, m - 1);
          }
        }
      }
    }
  }

  // add sea tiles around land
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let e = theMap[x + y * w];
      if (e === T.OCEAN) {
        // check in 6 directions
        let adjacent = getNeighbours(x, y);
        let m = Math.max(...adjacent);
        if (m > T.SEA) {
          theMap[x + w * y] = T.SEA;
        }
      }
    }
  }

  // Skal nå lage veier mellom øykjernene (senter på hver "øy"), merk at
  // øyene kan ha vokst sammen.
  // lager vei mellom a-b b-c c-d d-e e-f, ikke vei fra a til [b,f] osv

  /**
   * En todimensjonal proxy for kartet - Astar koden vil ha et array [ [] [] [] ... ]
   * Returnerer en subarray - dette er ikke en slice (som vil være en kopi)
   * En subarray er bare en view over samme uintarray theMap
   */
  const map2d = {
    get: function (obj, prop) {
      if (prop === "length") return w;
      return obj.subarray(prop * w, (prop + 1) * w);
    },
  };

  const grid = new Proxy(theMap, map2d);

  const easystar = new EasyStar.js();
  easystar.setGrid(grid);

  easystar.setAcceptableTiles([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  easystar.setTileCost(1, 40);
  easystar.setTileCost(2, 30);
  easystar.setTileCost(3, 20);
  easystar.setTileCost(8, 80);
  easystar.setTileCost(9, 99);
  easystar.setTileCost(7, 10);
  easystar.setTileCost(6, 5);
  //easystar.enableDiagonals();


  // Lag sti fra øy til øy 1-2  2-3  3-4 osv
  islands.reduce((from, to) => {
    if (from && to) {
      easystar.findPath(from.x, from.y, to.x, to.y, (path) => {
        if (path) {
          roads.push(path);
          const shallowList = [];
          path.forEach(r => {
            const {x,y} = r;
            let t = theMap[x + w * y];
            if (t < T.GRASS) {
                t = T.SHALLOWS;
                shallowList.push(r);
            }
            t |= T.ROAD;             // mark as road
            theMap[x + w * y] = t;
          });
          if (shallowList.length > 5) {
              // replace some with land
              const midway = shallowList[Math.trunc(shallowList.length/2)];
              makeIsland(midway);
          }
        }

      });
      easystar.calculate();
    }
    return to;
  }, null);

  function makeIsland(midway) {
      const {x,y} = midway
      theMap[x + w * y] = Math.min(roll(5,7),roll(5,7));
      const around = neighbours(x,y,w,h);
      around.forEach( ([x,y]) => {
        theMap[x + w * y] = Math.min(roll(4,7),roll(4,7));
      })
  }

  function getNeighbours(x, y) {
    let n = neighbours(x, y, w, h).map(([x, y]) => theMap[x + w * y]);
    return n.filter((e) => e > 0);
  }
  return {islands,roads};
}

/**
 * We stand on an island and throw a stone in random direction
 * The landing is within the island radius
 * @param {Object} island
 */
function throwStone(island) {
  let r = island.r;
  let R = r * r;
  let x, y;
  do {
    x = roll(-r, r);
    y = roll(-r, r);
  } while (x * x + y * y > R);
  return { x: island.x + x, y: island.y + y, r: Math.sqrt(x * x + y * y) };
}

function neighbours(x, y, w, h) {
  let n = [];
  n.push([(x + w - 1) % w, y]); //venstre
  n.push([(x + 1) % w, y]); // høyre
  n.push([x, (y + 1) % h]); // ned
  n.push([x, (y + h - 1) % h]); // opp
  n.push([(x + w - 1) % w, (y + 1) % h]); // venstre+ned
  n.push([(x + w - 1) % w, (y + h - 1) % h]); // venstre+opp
  n.push([(x + 1) % w, (y + 1) % h]); // høyre-ned
  n.push([(x + 1) % w, (y + h - 1) % h]); // høyre-opp
  return n;
}

export { build, T, B, neighbours, roads, walkCost };
