// @ts-check

import { roll } from './util.js';
import { EasyStar } from './Astar.js';

class T {
    static OCEAN = 1;
    static SEA = 2;
    static GRASS = 3;
    static PLAIN = 4;
    static SWAMP = 5;
    static FOREST = 6;
    static HILL = 7;
    static MOUNTAIN = 8
}

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
function build(theMap, w, h, _LAND = 3, _MINIMUM = 4, _RADIUS = 8, _FREQ = "8877766655443") {
    // fill map with ocean
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            theMap[y * 80 + x] = T.OCEAN;
        }
    }



   

    // generate random number of islands
    // x,y is pos, r is radius
    const RADIUS = _RADIUS;
    const LAND = _LAND;   //  1 = small islands  50 = large islands
    const MINIMUM = _MINIMUM;  // 1 = few islands 10 = many islands
    const FREQ = _FREQ;  // we pick from this list to choose terrain
    let size = w * w * h * h;
    let logSize = Math.floor(Math.log(size));
    let islandCount = MINIMUM + roll(Math.floor(logSize / 3 + 1), logSize + 1);
    let maxR = RADIUS + roll(3, 9);
    let minR = Math.max(1, RADIUS - roll(3, 9));
    // space the islands
    let m = Math.floor((w + h) / 2);
    let sqr = 3 + Math.floor(m / (Math.sqrt(islandCount)));
    let dx = -Math.floor(sqr / 1.7);
    let dy = Math.floor(sqr / 2.2);

    let islands = Array(islandCount).fill(0).map((e) => {
        dx += sqr;
        if (dx > w) {
            dx = sqr;
            dy += sqr;
            if (dy > h) {
                dy = h - Math.floor(sqr / 2);
            }
        }
        return { x: dx + roll(1, 5), y: dy + roll(1, 5), r: roll(minR, maxR) }
    });

    // remove islands of the map
    islands = islands.filter(e => e.x < w && e.y < h);

    // place initial mountain at island seed
    islands.forEach(e => { theMap[e.x + w * e.y] = T.MOUNTAIN })

    // stand on each island and throw stones
    islands.forEach(e => {
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

     /**
     * En todimensjonal proxy for kartet - Astar koden vil ha et array [ [] [] [] ... ]
     * Returnerer en subarray - dette er ikke en slice (som vil være en kopi)
     * En subarray er bare en view over samme uintarray theMap
     */
    const map2d = {
        get: function (obj, prop) {
            if (prop === "length") return w;
            return obj.subarray(prop * w, (prop+1) * w );
        }
    }

    const mainland = islands[0];
    const farland = islands[islands.length-1];
    const grid = new Proxy(theMap, map2d);
    console.log(mainland,farland);

    const easystar = new EasyStar.js();
    easystar.setGrid(grid);

    easystar.setAcceptableTiles([1,2,3,4,5,6,7,8]);
    easystar.setTileCost(1,30);
    easystar.setTileCost(2,20);
    easystar.setTileCost(8,90);
    easystar.setTileCost(7,10);
    easystar.setTileCost(6,5);
    //easystar.enableDiagonals();
    easystar.findPath(mainland.x, mainland.y,farland.x,farland.y,(path) => {
       if (path === null) {
           console.log("no path");
       } else {
           console.log(path);
           for (let p of path) {
             theMap[p.x + w * p.y] = T.GRASS;
           }
       }
    });
    easystar.calculate();


    function getNeighbours(x, y) {
        let n = neighbours(x, y, w, h).map(([x, y]) => theMap[x + w * y]);
        return n.filter(e => e > 0);
    }
    return islands;
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
    return { x: island.x + x, y: island.y + y, r: Math.sqrt(x * x + y * y) }
}

function neighbours(x, y, w, h) {
    let n = [];
    n.push([(x + w - 1) % w, y]);  //venstre
    n.push([(x + 1) % w, y]);      // høyre
    n.push([x, (y + 1) % h]);      // ned
    n.push([x, (y + h - 1) % h]);  // opp
    n.push([(x + w - 1) % w, (y + 1) % h]);      // venstre+ned
    n.push([(x + w - 1) % w, (y + h - 1) % h]);  // venstre+opp
    n.push([(x + 1) % w, (y + 1) % h]);      // høyre-ned
    n.push([(x + 1) % w, (y + h - 1) % h]);  // høyre-opp
    return n;
}

export { build, T, neighbours };