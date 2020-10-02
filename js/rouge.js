// @ts-check

import { Monster, Player } from "./modules/Monster.js";
import { Map } from "./modules/Terrain.js";
import { dice, clamp } from "./modules/util.js";

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
// Math.seedrandom("test");

export function setup() {
  const [
    divBoard,
    divMonsters,
    divActors,
    divInfo,
    cnvMinimap ,
    divStatus,
  ] = getByIds("board,monsters,actors,info,minimap,status");

  const brikkeListe = /** @type {HTMLElement[]} */ Array.from(
    divBoard.querySelectorAll("div")
  );

  document.addEventListener("keydown", doStuff);

  const { avatar, monsters, map } = startLevel(divMonsters, divActors);
  map.render(avatar.x-5, avatar.y-5, brikkeListe);
  avatar.render();
  enemyAction(monsters,avatar,map);

  // @ts-ignore
  const ctx = cnvMinimap.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  /**
   * @param {KeyboardEvent} e
   */
  function doStuff(e) {
    const key = e.key;
    avatar.action(key,map);
    enemyAction(monsters,avatar,map);
    map.render(avatar.x-5, avatar.y-5, brikkeListe);
    avatar.render();
    map.minimap(ctx,avatar);
  }
}

function enemyAction(monsters,avatar,map) {
    const {x,y} = avatar;   // må vite hvor avatar står da kartet centreres på hen
    const center = {x:x-5,y:y-5};
    for (let i = 0; i < monsters.length; i++) {
        let m = monsters[i];
        m.action(avatar,map);
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
  const FIENDS = 12;
  const avatar = new Player(1, 1);
  divActors.append(avatar.div);
  avatar.render();

  const monsters = [];
  for (let i = 0; i < FIENDS; i++) {
    const m = new Monster(0, 0);
    m.x = dice(80) - 1;
    m.y = dice(80) - 1;
    monsters.push(m);
    divMonsters.append(m.div);
  }

  const map = new Map();
  return { avatar, monsters, map };
}
