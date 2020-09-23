// @ts-check

class Avatar {
    x = 5;
    y = 5;
    div;

    render() {
        this.div.style.left = (this.x * 32) + "px";
        this.div.style.top = (this.y * 32) + "px";
    }
}


function setup() {
    const avatar = new Avatar();
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
                // gjør noe
                console.log("venstre");
                if (avatar.x > 0) {
                    avatar.x -= 1;
                    avatar.render();
                }
                break;
            case "ArrowRight":
                // gå til høyre
                console.log("høyre");
                if (avatar.x < 11) {
                    avatar.x += 1;
                    avatar.render();
                }
                break;
            case "ArrowUp":
                // gå opp
                console.log("opp");
                if (avatar.y > 0) {
                    avatar.y -= 1;
                    avatar.render();
                }
                break;
            case "ArrowDown":
                // gå ned
                console.log("ned");
                if (avatar.y < 11) {
                    avatar.y += 1;
                    avatar.render();
                }
                break;

        }
    }
}