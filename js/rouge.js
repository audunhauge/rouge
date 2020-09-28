// @ts-check

/**
 * Clamp låser en verdi til området [lo,hi]
 * Verdier utenfor blir til lo|hi
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
 * @returns {number} lo dersom x < lo, hi dersom x > hi, ellers uendra
 */

let avatar;

let monsters = [];

/**
 * Terningfunksjon
 * @param {number} n
 * @returns {number} terning verdi
 */
function dice(n) {
  return Math.trunc(Math.random() * n) + 1;
}

/**
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
 * @returns {number} lo <= return <= hi
 */
function clamp(x, lo, hi) {
  if (x > hi) return hi;
  if (x < lo) return lo;
  return x;
}

class Actor {
  x = 2;
  y = 2;
  /** @type {HTMLElement} */
  div;
  constructor() {
    console.log("Lager en ting");
  }
  render() {
    this.div.style.left = this.x * 32 + "px";
    this.div.style.top = this.y * 32 + "px";
    if (!this.alive) {
      this.div.style.opacity = "0.3";
      this.div.style.backgroundColor = "rgba(255,0,0,0.5)";
    }
  }
}

class Monster extends Actor {
  alive = true;
  constructor() {
    super();
  }
  move() {
    this.x = clamp(this.x + dice(3) - 2, 0, 11);
    this.y = clamp(this.y + dice(3) - 2, 0, 11);
  }
}

class Player extends Actor {
  constructor() {
    super();
  }
}

export function setup() {
  avatar = new Player();
  avatar.div = document.getElementById("avatar");
  avatar.render();

  document.addEventListener("keydown", doStuff);

  document.querySelectorAll(".monster").forEach((div) => {
    const m = new Monster();
    // @ts-ignore
    m.div = div;
    m.x = Math.trunc(Math.random() * 11);
    m.y = Math.trunc(Math.random() * 11);
    m.render();
    monsters.push(m);
  });

  /**
   * @param {KeyboardEvent} e
   */
  function doStuff(e) {
    const key = e.key;
    switch (key) {
      case "ArrowLeft":
        if (avatar.x > 0) {
          avatar.x -= 1;
          avatar.render();
        }
        break;
      case "ArrowRight":
        if (avatar.x < 11) {
          avatar.x += 1;
          avatar.render();
        }
        break;
      case "ArrowUp":
        if (avatar.y > 0) {
          avatar.y -= 1;
          avatar.render();
        }
        break;
      case "ArrowDown":
        if (avatar.y < 11) {
          avatar.y += 1;
          avatar.render();
        }
        break;
    }
    for (let i = 0; i < monsters.length; i++) {
      let m = monsters[i];
      m.move();
      m.render();
    }
  }
}
