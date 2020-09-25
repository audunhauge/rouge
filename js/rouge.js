// @ts-check

import  Map  from './mapgen/index.js';
/*
import Delaunator from './dual-mesh/node_modules/delaunator';
let Poisson = require('poisson-disk-sampling');
let TriangleMesh = require('./');
let MeshBuilder = require('./create');
let mesh = new MeshBuilder({boundarySpacing: 450})
        .addPoisson(Poisson, 450)
        .create(true);
*/
// const map = new Map([],{seed:123,amplitude:3,length:4},() => Math.random()*2-1);

/**
 * Clamp låser en verdi til området [lo,hi]
 * Verdier utenfor blir til lo|hi 
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
 * @returns {number} lo dersom x < lo, hi dersom x > hi, ellers uendra
 */
const clamp = (x, lo, hi) => Math.max(lo, Math.min(x, hi));
let avatar;
let divActors;
const monsters = [];

class Actor {
    x = 2;
    y = 2;
    alive = true;
    /** @type {HTMLElement} */
    div;
    render() {
        this.div.style.left = (this.x * 32) + "px";
        this.div.style.top = (this.y * 32) + "px";
        if (!this.alive) {
            this.div.style.opacity = "0.3";
            this.div.style.backgroundColor = "rgba(255,0,0,0.5)";
        }
    }
    /**
     * @param {Actor} other
     * @returns {number} distance squared
     */
    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return (dx ** 2 + dy ** 2);
    }
    /**
     * @param {Actor} other
     * @returns {boolean} true if close
     */
    canSee(other) {
        return this.distance(other) < 25;
    }
}

class Monster extends Actor {
    constructor() {
        super();
    }

    action() {
        if (!this.alive) return;
        if (this.canSee(avatar)) {
            if (this.distance(avatar) < 3) {
                this.attack(avatar);
            } else {
                this.towards(avatar);
            }
        } else {
            this.move();
        }
    }
    /**
     * @param {Actor} other
     */
    towards(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        this.x += clamp(dx, -1, 1);
        this.y += clamp(dy, -1, 1);
    }

    /**
     * @param {Actor} other
     */
    attack(other) {
        if (this.alive && other.alive) {
            divActors.classList.add("attack");
            setTimeout(() => divActors.classList.remove("attack"), 300);
        }
    }
    move() {
        if (!this.alive) return;
        this.x += Math.round(Math.random() * 2 - 1);
        this.y += Math.round(Math.random() * 2 - 1);
        this.x = clamp(this.x, 0, 11);
        this.y = clamp(this.y, 0, 11);
    }
}

class Avatar extends Actor {
    constructor() {
        super();
        this.x = 5;
        this.y = 5;
    }
}


export function setup() {
    avatar = new Avatar();
    document.querySelectorAll(".monster").forEach(div => {
        const monster = new Monster();
        monster.div = /** @type {HTMLElement}*/ (div);
        monsters.push(monster);
    })
    avatar.div = document.getElementById("avatar");
    divActors = document.getElementById("actors");
    avatar.render();
    monsters.forEach(g => g.render());

    document.addEventListener("keydown", doStuff);


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
            case "a":
                // attack something
                monsters.forEach(g => {
                    if (g.alive) {
                        if (g.distance(avatar) < 3) {
                            g.alive = false;
                        }
                    }
                })
                break;

        }
        monsters.forEach(goblin => {
            goblin.action();
            goblin.render();
        });
    }
}