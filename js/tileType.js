import { rgbToHex } from './util.js';

export class TileType {
    name = "Unamed Tile"
    altitude = 0; // 1 highest mountain
    color;


    constructor(name, altitude, color) {
        this.name = name;
        this.altitude = altitude;
        this.color = color;
    }
}


export var tileTypes = [
    new TileType("deep sea", 0.1, rgbToHex(0, 50, 160)),
    new TileType("sea", 0.43, rgbToHex(0, 120, 220)),
    new TileType("sand", 0.5, rgbToHex(230, 219, 142)),
    new TileType("grass", 0.535, rgbToHex(10, 209, 100)),
    new TileType("grass", 0.7, rgbToHex(120, 120, 120)),
];