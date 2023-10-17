export class Vec2 {
    x = 0;
    y = 0;

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    dist(otherVec2) {
        return Math.sqrt(Math.pow(this.x-otherVec2.x,2) + Math.pow(this.y-otherVec2.y,2))
    }

    ang() {
        return Math.atan2(this.y,this.x);
    }

    mag() {
        return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2))
    }

    add(otherVec2) {
        this.x += otherVec2.x;
        this.y += otherVec2.y;
    }
}