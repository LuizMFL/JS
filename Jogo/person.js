class person {
    constructor(mesh) {
        this.mesh = mesh;
        this.speed = 0;
        this.life = 100;
        this.itens = [];
        this.move = [false, false, false, false];
    }

    vida(x) {
        this.life += x;
    }

    velocidade(x) {
        this.speed += x;
    }

    setupInputs() {
        document.addEventListener("keydown", function (event) {
            if (event.key === "a") {
                this.move[0] = true;
            } else if (event.key == "w") {
                this.move[1] = true;
            } else if (event.key == "s") {
                this.move[2] = true;
            } else if (event.key == "d") {
                this.move[3] = true;
            }
        });

        document.addEventListener("keyup", function (event) {
            if (event.key === "a") {
                this.move[0] = false;
            } else if (event.key == "w") {
                this.move[1] = false;
            } else if (event.key == "s") {
                this.move[2] = false;
            } else if (event.key == "d") {
                this.move[3] = false;
            }
        });
    }
}