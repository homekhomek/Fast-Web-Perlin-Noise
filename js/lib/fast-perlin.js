export class FastPerlin {
    seeds = [Math.floor(Math.random() * 10000000), Math.floor(Math.random() * 10000000), Math.floor(Math.random() * 10000000), Math.floor(Math.random() * 10000000)];
    octaves = [5, 5, 5, 5];
    freqs = [2, 2, 2, 2];

    lastNoiseMap = null;

    simplexCanvas = null;
    gl = null;
    shaderProgram = null;


    constructor(width = 1000, height = 1000) {
        this.simplexCanvas = document.createElement("canvas");
        this.simplexCanvas.width = width;
        this.simplexCanvas.height = height;
        //this.simplexCanvas.style.display = "none";
        document.body.appendChild(this.simplexCanvas);
        this.gl = this.simplexCanvas.getContext('webgl2', { preserveDrawingBuffer: true });
        const ext = this.gl.getExtension("EXT_color_buffer_float");
        if (!ext) {
            alert("need EXT_color_buffer_float");
            return;
        }


        if (!this.gl) {
            console.error("WebGL 2 is not supported.");
        } else {
            console.log("WebGL 2 is supported!");
        }

        // Create a shader program
        const vertexShaderSource = `#version 300 es
        in vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

        const fragmentShaderSource = `#version 300 es
        precision mediump float;
        out vec4 fragColor; // Declare the output color variable
        uniform vec2 u_resolution;

        uniform float seed1;
        uniform float seed2;
        uniform float seed3;
        uniform float seed4;

        uniform float octave1;
        uniform float octave2;
        uniform float octave3;
        uniform float octave4;

        uniform float freq1;
        uniform float freq2;
        uniform float freq3;
        uniform float freq4;

        uint hash(uint x, uint seed) {
            const uint m = 0x5bd1e995U;
            uint hash = seed;
            // process input
            uint k = x;
            k *= m;
            k ^= k >> 24;
            k *= m;
            hash *= m;
            hash ^= k;
            // some final mixing
            hash ^= hash >> 13;
            hash *= m;
            hash ^= hash >> 15;
            return hash;
        }
        
        
        uint hash(uvec2 x, uint seed){
            const uint m = 0x5bd1e995U;
            uint hash = seed;
            // process first vector element
            uint k = x.x; 
            k *= m;
            k ^= k >> 24;
            k *= m;
            hash *= m;
            hash ^= k;
            // process second vector element
            k = x.y; 
            k *= m;
            k ^= k >> 24;
            k *= m;
            hash *= m;
            hash ^= k;
            // some final mixing
            hash ^= hash >> 13;
            hash *= m;
            hash ^= hash >> 15;
            return hash;
        }
        
        
        vec2 gradientDirection(uint hash) {
            switch (int(hash) & 3) { // look at the last two bits to pick a gradient direction
            case 0:
                return vec2(1.0, 1.0);
            case 1:
                return vec2(-1.0, 1.0);
            case 2:
                return vec2(1.0, -1.0);
            case 3:
                return vec2(-1.0, -1.0);
            }
        }
        
        float interpolate(float value1, float value2, float value3, float value4, vec2 t) {
            return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);
        }
        
        vec2 fade(vec2 t) {
            // 6t^5 - 15t^4 + 10t^3
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }
        
        float perlinNoise(vec2 position, uint seed) {
            vec2 floorPosition = floor(position);
            vec2 fractPosition = position - floorPosition;
            uvec2 cellCoordinates = uvec2(floorPosition);
            float value1 = dot(gradientDirection(hash(cellCoordinates, seed)), fractPosition);
            float value2 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 0)), seed)), fractPosition - vec2(1.0, 0.0));
            float value3 = dot(gradientDirection(hash((cellCoordinates + uvec2(0, 1)), seed)), fractPosition - vec2(0.0, 1.0));
            float value4 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 1)), seed)), fractPosition - vec2(1.0, 1.0));
            return interpolate(value1, value2, value3, value4, fade(fractPosition));
        }
        
        float perlinNoise(vec2 position, int frequency, int octaveCount, float persistence, float lacunarity, uint seed) {
            float value = 0.0;
            float amplitude = 1.0;
            float currentFrequency = float(frequency);
            uint currentSeed = seed;
            for (int i = 0; i < octaveCount; i++) {
                currentSeed = hash(currentSeed, 0x0U); // create a new seed for each octave
                value += perlinNoise(position * currentFrequency, currentSeed) * amplitude;
                amplitude *= persistence;
                currentFrequency *= lacunarity;
            }
            return (value + 1.0) * 0.5;
        }
        
        void main() {
            vec2 pos = gl_FragCoord.xy / u_resolution;

            float value1 = perlinNoise(pos, int(freq1), int(octave1), 0.5, 2.0, uint(floor(seed1))); // multiple octaves
            float value2 = perlinNoise(pos, int(freq2), int(octave2), 0.5, 2.0, uint(floor(seed2))); // multiple octaves
            float value3 = pow(perlinNoise(pos, int(freq3), int(octave3), 0.5, 2.0, uint(floor(seed3))),4.); // multiple octaves
            float value4 = perlinNoise(pos, int(freq4), int(octave4), 0.5, 2.0, uint(floor(seed4))); // multiple octaves
    
            //fragColor  = vec4(value1,value2,value3,value4);


            if(value1 > .6 || abs(value2 - .5) < .03) {
                fragColor = vec4(vec3(1.),1.);
            }
            else  {
                fragColor = vec4(vec3(0.),1.);
            }
        }`;

        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);
        this.gl.compileShader(fragmentShader);

        if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            const compilationLog = this.gl.getShaderInfoLog(fragmentShader);
            console.error("Fragment shader compilation error:", compilationLog);
        } else {
            console.log("Fragment shader compiled successfully!");
        }


        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        this.gl.useProgram(this.shaderProgram);

        // Set up vertex data for a rectanthis.gle covering the entire canvas
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "a_position");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    }


    generateNoise() {
        this.octaves.forEach((o, i) => {
            const octaveLoc = this.gl.getUniformLocation(this.shaderProgram, `octave${i + 1}`);
            this.gl.uniform1f(octaveLoc, o);
        });

        this.seeds.forEach((s, i) => {
            const seedLoc = this.gl.getUniformLocation(this.shaderProgram, `seed${i + 1}`);
            this.gl.uniform1f(seedLoc, s);
        });

        this.freqs.forEach((f, i) => {
            const freqLoc = this.gl.getUniformLocation(this.shaderProgram, `freq${i + 1}`);
            this.gl.uniform1f(freqLoc, f);
        });

        const resolutionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_resolution");
        const resolution = [this.simplexCanvas.width, this.simplexCanvas.height];
        this.gl.uniform2fv(resolutionLocation, resolution)


        this.gl.viewport(0, 0, this.simplexCanvas.width, this.simplexCanvas.height);


        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.GL_COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.lastNoiseMap = new Uint8Array(this.simplexCanvas.width * this.simplexCanvas.height * 4);
        this.gl.readPixels(0, 0, this.simplexCanvas.width, this.simplexCanvas.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.lastNoiseMap);
    }

    getPixelByIndex(index) {
        index *= 4;

        const r = this.lastNoiseMap[index]; // Red component
        const g = this.lastNoiseMap[index + 1]; // Green component
        const b = this.lastNoiseMap[index + 2]; // Blue component
        const a = this.lastNoiseMap[index + 3]; // Alpha component
        console.log(`Pixel color at (${index}): R=${r}, G=${g}, B=${b}, A=${a}`);
    }

    getPixel(x, y) {
        const index = (y * this.simplexCanvas.width + x); // Calculate the index of the pixel
        return this.getPixelByIndex(index);
    }
}

