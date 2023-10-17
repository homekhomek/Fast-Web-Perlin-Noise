import {Vec2} from './vec2.js';
import {TileType, tileTypes} from './tileType.js';

export class Tile {
    pos = new Vec2()
    tileType;

    constructor(pos,tileType) {
        this.tileType = tileType;
        this.pos = pos;
    }
    
}
