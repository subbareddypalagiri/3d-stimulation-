import urllib.request
import os

textures = {
    'mercury.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg',
    'venus.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Cylindrical_Map_of_Venus.jpg',
    'mars.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
    'jupiter.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg',
    'saturn.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg',
    'uranus.jpg': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
    'saturn_ring.png': 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_ring_alpha.png',
    'neptune.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg',
    'galaxy.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg'
}

os.makedirs('public/textures', exist_ok=True)

opener = urllib.request.build_opener()
opener.addheaders = [('User-agent', 'MyPlanetDownloader/1.0 (test@test.com)')]
urllib.request.install_opener(opener)

for name, url in textures.items():
    dest = f"public/textures/{name}"
    try:
        print(f"Downloading {name}...")
        urllib.request.urlretrieve(url, dest)
        print(f"Success: {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
