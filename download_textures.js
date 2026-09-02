import fs from 'fs';
import path from 'path';

const TEXTURES = {
    // Mercury
    'mercury.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/mercury.jpg',
    // Venus
    'venus.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/venus.jpg',
    // Earth (from ThreeJS repo which we know works well)
    'earth_color.jpg': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'earth_water.png': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'earth_normal.png': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'earth_clouds.png': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    // Mars
    'mars.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/mars.jpg',
    // Jupiter
    'jupiter.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/jupiter.jpg',
    // Saturn
    'saturn.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/saturn.jpg',
    'saturn_ring.png': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/saturn_ring.png', // Or procedurally generate ring if it fails
    // Uranus
    'uranus.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/uranus.jpg',
    // Neptune
    'neptune.jpg': 'https://raw.githubusercontent.com/82mou/sandbox/master/img/neptune.jpg',
    // Moon
    'moon.jpg': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
};

const dir = './public/textures';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadTexture(filename, url) {
    const filepath = path.join(dir, filename);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`Successfully downloaded ${filename}`);
    } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
    }
}

async function main() {
    console.log("Starting texture downloads from reliable github repos...");
    const promises = [];
    for (const [filename, url] of Object.entries(TEXTURES)) {
        promises.push(downloadTexture(filename, url));
    }
    await Promise.all(promises);
    console.log("All downloads finished!");
}

main();
