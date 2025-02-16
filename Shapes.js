class ShapeRegistry {
  defaultshapeStr = `
    o*oo oooo **oo oo*o
    o*oo ***o o*oo ***o
    o**o *ooo o*oo oooo
    oooo oooo oooo oooo
    o*oo oooo
    o*oo ****
    o*oo oooo
    o*oo oooo
    o*oo oooo o*oo o*oo 
    o**o ***o **oo ***o 
    o*oo o*oo o*oo oooo 
    oooo oooo oooo oooo 
    o*oo oooo
    o**o o**o
    oo*o **oo
    oooo oooo
    o*oo *ooo o**o oooo
    o*oo ***o o*oo ***o
    **oo oooo o*oo oo*o
    oooo oooo oooo oooo
    o*oo oooo
    **oo **oo
    *ooo o**o
    oooo oooo
    **oo 
    **oo 
    oooo 
    oooo 
    `
  colors = [
    "#FA7F48",
    "#F5C43D",
    "#3D90F4",
    "#9C47FA",
    "#F54286",
    "#D3EF3E",
    "#49F0D1",
    "#4AF456",
  ]
  shapes = [new Shape()]

  constructor(shapeStr) {
    this.shapes = this.genShapes(shapeStr || this.defaultshapeStr)
  }

  genShapes(shapeStr) {
    this.shapes.length = 0
    let shapeStrArray = []
    let shapeStrLines = shapeStr
      .trim()
      .split("\n")
      .map((l) => l.trim())
    for (let i = 0; i < shapeStrLines.length; i = i + 4) {
      let shapeStrGroup = []
      for (let j = 0; j < shapeStrLines[i].split(" ").length; j++) {
        shapeStrGroup.push(
          [0, 1, 2, 3].map((n) => shapeStrLines[i + n].split(" ")[j])
        )
      }
      shapeStrArray.push(shapeStrGroup)
    }
    this.shapes = shapeStrArray
      .map((sg) => sg.map((s) => s.join("\n")))
      .map((s, k) => new Shape(s, this.colors[k]))
    return this.shapes
  }
}

class Shape {
  color = "white"
  frames = [new Frame()]
  constructor(shapeStrArray = "", color = "white") {
    this.color = color
    if (shapeStrArray) {
      this.frames = shapeStrArray.map((shapeStr) => new Frame(shapeStr))
    }
  }
}

class Frame {
  points = [[1]]
  color = "white"
  constructor(shapeStr, color = "white") {
    this.color = color
    if (shapeStr) {
      this.build(shapeStr)
    }
  }
  build(shapeStr) {
    this.points = shapeStr
      .split("\n")
      .map((l) => l.trim())
      .map((l) => l.split("").map((c) => (c === "*" ? 1 : 0)))
  }
}

class Sprite {
  shape = new Shape()
  frameIndex = 0
  x = 0
  y = 0
  constructor(shape, frameIndex = 0, x = 0, y = 0) {
    this.shape = shape
    this.frameIndex = frameIndex
    this.x = x
    this.y = y
  }
  getFrame() {
    return this.shape.frames[this.frameIndex]
  }
}
