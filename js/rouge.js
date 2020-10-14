// @ts-check

import { Monster } from "./modules/Monster.js";
import { Player } from "./modules/Player.js";
import { Map, Road } from "./modules/Terrain.js";
import { clamp, dice, roll } from "./modules/util.js";
import { B } from "./modules/MapGen.js";

/**
 * Tar en liste med ids og kjører getById på dem
 * @param {string} list
 * @returns {HTMLElement[]}
 */
const getByIds = (list) => {
  const idList = list.split(",");
  return idList.map((id) => document.getElementById(id));
};


let keys = {};  // active keys


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

  for (let i = 0; i < 144; i++) {
    const div = document.createElement("div");
    divBoard.append(div);
    div.style.top = (32 * Math.trunc(i / 12)) + "px";
    div.style.left = (32 * (i % 12)) + "px";
  }

  let moveTimer;  // setter en timeout på tenketid for spiller

  const brikkeListe = /** @type {HTMLElement[]} */ Array.from(
    divBoard.querySelectorAll("div")
  );

  // bevegelse av avatar
  // venter på keyup slik at vi kan sjekke om to piltaster
  // er aktive samtidig
  const delta = { dx: 0, dy: 0 };

  document.addEventListener("keydown", setkey);
  document.addEventListener("keyup", getReady);

  // overCtx er et canvas som ligger over brikkene
  // tegner veier (og elver - senere) på denne
  /**  @type {CanvasRenderingContext2D} */   // @ts-ignore
  const overCtx = canOverlay.getContext("2d");
  let { avatar, monsters, map } = startLevel(divMonsters, divActors);
  const roads = new Road(map.roads, overCtx)
  roads.render();

  // rendrer startposisjon og minimap
  map.render(avatar.x - 5, avatar.y - 5, brikkeListe);
  avatar.render();
  enemyAction(monsters, avatar, map);

  /**  @type {CanvasRenderingContext2D} */   // @ts-ignore
  const minimapCtx = cnvMinimap.getContext("2d");
  minimapCtx.imageSmoothingEnabled = false;
  map.minimap(minimapCtx, avatar);

  /**
   * @param {KeyboardEvent} e
   */
  function setkey(e) {
    keys[e.key] = 1;
    keys.LAST = e.key;
  }

  // Bruker har ikke flytta innen gitt tidsfrist
  // la monster gjøre sine ting
  function nextMove() {
    delta.dx = 0;
    delta.dy = 0;
    doStuff();
  }

  /**
   * Bruker slapp opp en knapp - sjekk hvilke
   * som var aktivert - kan dermed trykke
   * venstre + ned for å gå på skrå nedover.
   * Tastetrykk er allerede lagra i keys
   * verdien er 1 for aktive knapper
   * Kan være 0 eller undefined for alle andre knapper
   * Bruker derfor ??
   * @param {KeyboardEvent} e
   */
  function getReady(e) {
    let dx = 0; let dy = 0;
    dx -= (keys.ArrowLeft ?? 0);
    dx += (keys.ArrowRight ?? 0);
    dy -= (keys.ArrowUp ?? 0);
    dy += (keys.ArrowDown ?? 0);
    delta.dx = dx;
    delta.dy = dy;
    doStuff();
  }


  /**
   * Var opprinnelig kobla til eventlistener for keydown
   * Nå aktiveres denne fra nextMove - timerstyrt
   * eller doStuff - trigga av keyup
   * Dermed går spillet videre ved brukerhendelse eller etter 1s
   */
  function doStuff() {
    clearTimeout(moveTimer);
    avatar.action(delta, map, keys.LAST, monsters);
    delta.dx = 0;
    delta.dy = 0;
    keys = {};  // glem gamle tastetrykk
    enemyAction(monsters, avatar, map);
    const { x, y } = avatar;
    map.render(x - 5, y - 5, brikkeListe);
    avatar.render();
    avatar.recover();
    avatar.showStats(divInfo);
    const center = { x: x - 6, y: y - 6 };
    roads.overlay(center);
    map.minimap(minimapCtx, avatar);
    moveTimer = setTimeout(nextMove, 1000);
    monsters = monsters.filter(m => m.alive || m.ragdoll > 0);
  }
}

function enemyAction(monsters, avatar, map) {
  const { x, y } = avatar;   // kart sentreres på avatar
  const center = { x: x - 5, y: y - 5 };
  for (let i = 0; i < monsters.length; i++) {
    let m = monsters[i];
    if (m.alive) {
      m.action(avatar, map);
      m.render(center);
    } else {
      m.decay(center);
    }
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


  let monsters = [];
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
