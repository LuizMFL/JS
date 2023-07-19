import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class CharacterControls {
    model;
    mixer;
    animationsMap;
    currentAction;
    camera;
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuarternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();
    fadeDuration = 0.2;
    runVelocity = 5;
    walkVelocity = 2;
    toggleRun = true;
    // Cannon
    constructor(model, mixer, animationsMap, camera, currentAction) {
        this.DIRECTIONS = ['w', 'a', 's', 'd', ' '];
        this.model = model;
        this.mixer = mixer;
        this.currentAction = currentAction;
        this.animationsMap = animationsMap;
        this.animationsMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play();
            }
        });
        this.camera = camera;
        this.box = new CANNON.Body({ mass: 10, shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), });
        this.box.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
        this.canJump = false;
        this.box.addEventListener("collide", (e) => {
            var contactNormal = new CANNON.Vec3();
            var upAxis = new CANNON.Vec3(0, 1, 0);
            var contact = e.contact;
            if (contact.bi.id == this.box.id) {
                contact.ni.negate(contactNormal);
            } else {
                contactNormal.copy(contact.ni);
            }
            if (contactNormal.dot(upAxis) > 0.5) {
                this.canJump = true;
            }
        });
    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun;
    }

    update(delta, keyPressed) {
        this.model.position.set(this.box.position.x, this.box.position.y, this.box.position.z);
        var directionPressed = this.DIRECTIONS.some(key => keyPressed[key] == true);
        var play = '';

        if (directionPressed && this.toggleRun) {
            play = 'Run';
        } else if (directionPressed) {
            play = 'Walk';
        } else {
            play = 'Idle';
        }

        if (this.currentAction != play) {
            var toPlay = this.animationsMap.get(play);
            var current = this.animationsMap.get(this.currentAction);
            current.fadeOut(this.fadeDuration);
            toPlay.reset().fadeIn(this.fadeDuration).play();
            this.currentAction = play;
        }
        this.mixer.update(delta);
        if (this.currentAction == 'Run' || this.currentAction == 'Walk') {
            // calculAte towards camera direction
            var angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            );
            var directionOffset = this.directionOffset(keyPressed);

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            // run/walk velocity
            const velocity = (this.currentAction == 'Run' ? this.runVelocity : this.walkVelocity);

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta;
            const moveZ = this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
        }
        this.box.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
        this.updateCameraTarget();
    }

    directionOffset(keysPressed) {
        if (keysPressed[' '] && this.canJump) {
            this.box.velocity.y += 10;
            this.canJump = false;
        }

        var directionOffset = 0; // w

        if (keysPressed['w']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed['d']) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed['s']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed['a']) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed['d']) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }

    updateCameraTarget() {
        // move camera
        this.camera.position.x = this.model.position.x;
        this.camera.position.y = this.model.position.y + 5;
        this.camera.position.z = this.model.position.z + 12;

        // update camera target
        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 1;
        this.cameraTarget.z = this.model.position.z;
    }

}