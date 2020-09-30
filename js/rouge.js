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

export function setup() {
  const [
    divBoard,
    divMonsters,
    divActors,
    divInfo,
    divMinimap,
    divStatus,
  ] = getByIds("board,monsters,actors,info,minimap,status");

  const brikkeListe = /** @type {HTMLElement[]} */ Array.from(
    divBoard.querySelectorAll("div")
  );

  document.addEventListener("keydown", doStuff);

  const { avatar, monsters, map } = startLevel(divMonsters, divActors);
  map.render(avatar.x-5, avatar.y-5, brikkeListe);
  avatar.render();
  enemyAction(monsters,avatar);

  /**
   * @param {KeyboardEvent} e
   */
  function doStuff(e) {
   
    const key = e.key;
    switch (key) {
      case "ArrowLeft":
        if (avatar.x > 0) {
          avatar.x -= 1;
        }
        break;
      case "ArrowRight":
        if (avatar.x < B.w - 1) {
          avatar.x += 1;
        }
        break;
      case "ArrowUp":
        if (avatar.y > 0) {
          avatar.y -= 1;
        }
        break;
      case "ArrowDown":
        if (avatar.y < B.h - 1) {
          avatar.y += 1;
        }
        break;
    }
    enemyAction(monsters,avatar);
    map.render(avatar.x-5, avatar.y-5, brikkeListe);
    avatar.render();
  }
}

function enemyAction(monsters,avatar) {
    const {x,y} = avatar;   // må vite hvor avatar står da kartet centreres på hen
    const center = {x,y};
    for (let i = 0; i < monsters.length; i++) {
        let m = monsters[i];
        m.move();
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
  const FIENDS = 4;
  const avatar = new Player(1, 1);
  divActors.append(avatar.div);
  avatar.render();

  const monsters = [];
  for (let i = 0; i < FIENDS; i++) {
    const m = new Monster(0, 0);
    m.x = dice(12) - 1;
    m.y = dice(12) - 1;
    monsters.push(m);
    divMonsters.append(m.div);
  }

  const map = new Map();
  return { avatar, monsters, map };
}
