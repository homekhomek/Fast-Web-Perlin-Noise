
import { PIXI } from './lib/pixi.min.js';
import * as dat from './lib/dat.gui.module.js';
import { rgbToHex } from './util.js';
import { Vec2 } from './vec2.js';
import { Tile } from './tile.js';
import { TileType, tileTypes } from './tileType.js';
import { createNoise3D } from './lib/simplex-noise.js';
import { FastPerlin } from './lib/fast-perlin.js';



console.time("fastSimplex");
var fs = new FastPerlin();
fs.octaves[0] = 7;
fs.freqs[0] = 9;

fs.octaves[1] = 8;
fs.freqs[1] = 20;


fs.generateNoise()
fs.getPixel(12, 12)
console.timeEnd("fastSimplex")