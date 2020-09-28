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
}



export function setup() {
    avatar = new Actor();
    avatar.div = document.getElementById("avatar");
    avatar.render();

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

        }
    }
}