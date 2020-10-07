// @ts-check

import { Monster, Player } from "./modules/Monster.js";
import { Map } from "./modules/Terrain.js";
import { clamp, dice, roll } from "./modules/util.js";

/**
 * Tar en liste med ids og kjører getById på dem
 * @param {string} list
 * @returns {HTMLElement[]}
 */
const getByIds = (list) => {
  const idList = list.split(",");
  return idList.map((id) => document.getElementById(id));
};

// dimensjonene på spillebrettet
const B = { w: 80, h: 80 };



const oldRand = Math.random;    // keep old random version
//Math.seedrandom("test4");

export function setup() {
  const [
    canOverlay,
    divBoard,
    divMonsters,
    divActors,
    divInfo,
    cnvMinimap,
    divStatus,
  ] = getByIds("overlay,board,monsters,actors,info,minimap,status");

  const brikkeListe = /** @type {HTMLElement[]} */ Array.from(
    divBoard.querySelectorAll("div")
  );

  document.addEventListener("keydown", doStuff);

  const { avatar, monsters, map } = startLevel(divMonsters, divActors);
  map.render(avatar.x - 5, avatar.y - 5, brikkeListe);
  avatar.render();
  enemyAction(monsters, avatar, map);

  // @ts-ignore
  const minimapCtx = cnvMinimap.getContext("2d");
  minimapCtx.imageSmoothingEnabled = false;
  map.minimap(minimapCtx, avatar);

 
  /**  @type {CanvasRenderingContext2D} */   // @ts-ignore
  const overCtx = canOverlay.getContext("2d");

  overCtx.lineWidth = 2;
  overCtx.strokeStyle = 'blue';
  overCtx.beginPath();
  overCtx.moveTo(10,10);
  overCtx.lineTo(530,530);
  overCtx.stroke();

  /**
   * @param {KeyboardEvent} e
   */
  function doStuff(e) {
    const key = e.key;
    avatar.action(key, map);
    enemyAction(monsters, avatar, map);
    map.render(avatar.x - 5, avatar.y - 5, brikkeListe);
    avatar.render();
    map.minimap(minimapCtx, avatar);
  }
}

function enemyAction(monsters, avatar, map) {
  const { x, y } = avatar;   // må vite hvor avatar står da kartet centreres på hen
  const center = { x: x - 5, y: y - 5 };
  for (let i = 0; i < monsters.length; i++) {
    let m = monsters[i];
    m.action(avatar, map);
    m.render(center);
  }
}

/**
 * Creates a new level and populates it with monsters
 * Returns the avatar and monsters array
 * @param {HTMLElement} divMonsters
 * @param {HTMLElement} divActors
 * @returns { { avatar: Player, monsters: Monster[], map: Map }}
 */
function startLevel(divMonsters, divActors) {
  const map = new Map();
  const FIENDS = 42;
  const avatar = new Player(1, 1);
  const homeland = map.islands[0]; //map.islands[roll(0, map.islands.length)];
  avatar.x = clamp(homeland.x + roll(1, homeland.r), 1, B.w - 1);
  avatar.y = clamp(homeland.y + roll(1, homeland.r), 1, B.h - 1);
  divActors.append(avatar.div);
  avatar.render();


  const monsters = [];
  for (let i = 0; i < FIENDS; i++) {
    const m = new Monster(0, 0);
    let tries;
    for (tries = 0; tries < 8; tries++) {
      const homeland = map.islands[roll(0, map.islands.length)];
      m.x = clamp(homeland.x + roll(1, homeland.r), 1, B.w - 1);
      m.y = clamp(homeland.y + roll(1, homeland.r), 1, B.h - 1);
      const t = String(map.fetch(m.x, m.y));
      if (m.canWalk(t)) break;
    }
    if (tries < 8) {
      monsters.push(m);
      divMonsters.append(m.div);
    } else {
      console.log("bad monster");
    }
  }
  return { avatar, monsters, map };
}
