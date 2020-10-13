// @ts-check

import { clamp, dice } from "./util.js";
import { B, T } from "./MapGen.js";
import { Actor, Thing, Stats } from "./Monster.js";

class Player extends Actor {
    turnOver = false;
    stamina = 2;          // brukes på moves og angrep/spells
    mana = 10;            // magisk kraft tilgjengelig til spells
    /**
     * @param {any} x
     * @param {any} y
     */
    constructor(x, y) {
      super(x, y);
      const div = document.createElement("div");
      div.id = "avatar";
      this.div = /** @type {HTMLElement} */ (div);
    }
  
    // hver turn regenereres stamina og mana
    recover() {
      this.regen("stamina",1);
      this.regen("mana",1);
    }
  
    render() {
      let { x, y } = this;
      let ix = clamp(x - 5, 0, 80 - 11);
      let iy = clamp(y - 5, 0, 80 - 11);
      if (ix === 69) {
        x = x - 69;
      } else {
        x = clamp(x, 0, 5);
      }
      if (iy === 69) {
        y = y - 69;
      } else {
        y = clamp(y, 0, 5);
      }
      this.div.style.left = x * 32 + "px";
      this.div.style.top = y * 32 + "px";
    }
  
    canWalk(t) {
      return "34567".includes(t) || t & T.ROAD;
    }
  
    move(dx, dy) {
      this.x = (this.x +dx + B.w) % B.w;
      this.y = (this.y +dy + B.h) % B.h;
    }
  
  
  
    /**
     * @param {{dx:number,dy:number}} delta 
     * @param {import("./Terrain.js").Map} map
     */
    action(delta, map) {
      const { x, y } = this;
      const {dx,dy} = delta;
      
      if (dx || dy) {
        const newx = (x +dx + B.w) % B.w;
        const newy = (y +dy + B.h) % B.h;
        const t = String(map.fetch(newx, newy));
        if (this.canWalk(t)) {
          map.clear(x, y)
          this.move(dx, dy);
          map.place(Thing.MONSTER, newx, newy);
        }
      }
    }
  
  }
  
  export {  Player };
  