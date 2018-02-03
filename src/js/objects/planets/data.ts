export const planets = {
  "sun": {
    "radius": 69600,
    "distance": 0,
    "periodOfRevolution": 0,
    "periodOfRotation": 15,
    "color": 0xFEDF3C,
    "texture": "./assets/webgl/images/sun-map.jpg"
  },
  "mercury": {
    "radius": 2440,
    "distance": 59700000,
    "periodOfRevolution": 87.96,
    "periodOfRotation": 58.6,
    "color": 0xB5C0BA,
    "texture": "./assets/webgl/images/mercury-map.jpg"
  },
  "venus": {
    "radius": 6052,
    "distance": 108200000,
    "periodOfRevolution": 224.68,
    "periodOfRotation": 243,
    "color": 0xE14920,
    "texture": "./assets/webgl/images/venus-map.jpg"
  },
  "earth": {
    "radius": 6371,
    "distance": 149600000,
    "periodOfRevolution": 365.26,
    "periodOfRotation": 0.99,
    "color": 0x0000FF,
    "texture": "./assets/webgl/images/earth-map.jpg",
    "textureSpecular": "./assets/webgl/images/earth-specular-map.jpg",
    "textureNormal": "./assets/webgl/images/earth-normal-map.png",
    "moons": [
      {
        "radius": 2440,
        "distance": 384400,
        "periodOfRevolution": 27,
        "periodOfRotation": 2,
        "color": 0xAAAAAA,
        "texture": "./assets/webgl/images/moon-map.jpg",
      }
    ]
  },
  "mars": {
    "radius": 3390,
    "distance": 227900000,
    "periodOfRevolution": 686.98,
    "periodOfRotation": 1.03,
    "color": 0xAF762B,
    "texture": "./assets/webgl/images/mars-map.jpg"
  },
  "jupiter": {
    "radius": 69911,
    "distance": 778300000,
    "periodOfRevolution": 4331.98,
    "periodOfRotation": 0.41,
    "color": 0xA1976B,
    "texture": "./assets/webgl/images/jupiter-map.jpg"
  },
  "saturn": {
    "radius": 58232,
    "distance": 1427000000,
    "periodOfRevolution": 10760.56,
    "periodOfRotation": 0.45,
    "color": 0xFDEDB5,
    "texture": "./assets/webgl/images/saturn-map.jpg",
    "rings": [
      {
        "radius": 137000,
        "tube": 1000,
        "rotation": 90,
        "opacity": 0.7,
        "texture": "./assets/webgl/images/saturn-ring-texture.jpg",
      }
    ]
  },
  "uranus": {
    "radius": 25362,
    "distance": 2871000000,
    "periodOfRevolution": 30685.49,
    "periodOfRotation": 0.71,
    "color": 0x70EEF3,
    "texture": "./assets/webgl/images/uranus-map.png",
    "rings": [
      {
        "radius": 63500,
        "tube": 100,
        "rotation": 0,
        "opacity": 0.4,
        "texture": "./assets/webgl/images/saturn-ring-texture.jpg",
      }
    ]
  },
  "neptune": {
    "radius": 24622,
    "distance": 4497100000,
    "periodOfRevolution": 60191.19,
    "periodOfRotation": 0.67,
    "color": 0xA160B1,
    "texture": "./assets/webgl/images/neptune-map.jpg"
  }
};
