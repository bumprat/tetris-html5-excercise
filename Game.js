// 俄罗斯方块
// 2025-02-15
class Game {
  gameTimer = 0
  autoMoveInterval = 500
  autoMovePrevTime = 0
  userInputInterval = 50
  userInputPrevTime = 0
  removeInterval = 30
  level = 1
  stageSelector = "#stage"
  nextSelector = "#next"
  shapeReg = new ShapeRegistry()
  stageGrid = new Grid()
  nextGrid = new Grid()
  nextInput = ""
  gameover = false
  stageEl = document.createElement("div")
  nextEl = document.createElement("div")
  logEl = document.createElement("div")
  scoreEl = document.createElement("div")
  gameOverEl = document.createElement("div")
  startGameEl = document.createElement("div")
  controlEl = document.createElement("div")
  maxScore = new MaxScore()
  score = new Score()
  keepPressing = false

  constructor(
    stageEl,
    nextEl,
    scoreEl,
    startGameEl,
    gameOverEl,
    controlEl,
    maxScoreEl,
    logEl
  ) {
    const self = this
    this.stageEl = stageEl || this.stageEl
    this.nextEl = nextEl || this.nextEl
    this.logEl = logEl || this.logEl
    this.gameOverEl = gameOverEl || this.gameOverEl
    this.startGameEl = startGameEl || this.startGameEl
    this.controlEl = controlEl || this.controlEl
    this.startGameEl.addEventListener("click", () => self.newGame())
    this.score.setEl(scoreEl)
    this.maxScore.setEl(maxScoreEl)
    this.maxScore.showMaxScore()
    this.build()
    this.addInputListener()
    this.newGame()
  }

  build(numOfRows = 20, numOfCols = 10) {
    this.stop()
    this.stageGrid = new Grid(this.stageEl, numOfRows, numOfCols)
    this.stageGrid.build()
    this.nextGrid = new Grid(this.nextEl, 4, 4)
    this.nextGrid.build()
  }

  addInputListener() {
    let self = this
    document.body.addEventListener("keydown", function (e) {
      self.nextInput = e.key
    })
    this.addButton(this.controlEl.querySelector("#up"), "ArrowUp")
    this.addButton(this.controlEl.querySelector("#down"), "ArrowDown")
    this.addButton(this.controlEl.querySelector("#left"), "ArrowLeft")
    this.addButton(this.controlEl.querySelector("#right"), "ArrowRight")
    document.body.oncontextmenu = () => false
  }

  addButton(el, input) {
    let self = this
    let pressing = false
    el.addEventListener("pointerdown", function (e) {
      self.nextInput = input
      pressing = true
      setTimeout(function () {
        if (pressing) {
          self.nextInput = input
          self.keepPressing = true
        }
      }, 600)
    })
    el.addEventListener("pointerleave", function () {
      pressing = false
      self.keepPressing = false
    })
  }

  newGame() {
    this.gameover = false
    this.stageGrid.clearGrid(true)
    this.nextGrid.clearGrid(true)
    this.currentSprite = null
    this.nextSprite = null
    this.genNext()
    this.nextEnter()
    this.genNext()
    this.nextGrid.drawGrid()
    this.stageGrid.drawGrid()
    this.start()
    this.score.setScore(0)
    this.score.showScore()
    this.log("游戏开始")
    this.gameOverEl.style.visibility = "hidden"
  }

  log(txt) {
    this.logEl.innerHTML += "🚀" + txt + "<br />"
  }

  start() {
    this.gameTimer = requestAnimationFrame(this.step.bind(this))
    this.autoMovePrevTime = Date.now()
  }

  async step() {
    let now = Date.now()
    if (this.gameover) return
    if (now - this.autoMovePrevTime > this.autoMoveInterval) {
      this.autoMovePrevTime = now
      await this.moveY()
    }
    if (now - this.userInputPrevTime > this.userInputInterval) {
      this.userInputPrevTime = now
      await this.checkUserInput()
    }
    this.gameTimer = requestAnimationFrame(this.step.bind(this))
  }

  async checkUserInput() {
    switch (this.nextInput) {
      case "ArrowRight":
        this.moveX()
        break
      case "ArrowLeft":
        this.moveX(-1)
        break
      case "ArrowUp":
        this.rotate()
        break
      case "ArrowDown":
        await this.moveY()
        break
    }
    if (!this.keepPressing) {
      this.nextInput = ""
    }
  }

  stop() {
    this.gameover = true
  }

  genNext() {
    let shapeIndex = Math.floor(this.shapeReg.shapes.length * Math.random())
    let shape = this.shapeReg.shapes[shapeIndex]
    let frameIndex = Math.floor(shape.frames.length * Math.random())
    this.nextSprite = new Sprite(shape, frameIndex)
    this.nextGrid.clearGrid()
    this.nextGrid.putSprite(this.nextSprite)
    this.nextGrid.drawGrid()
  }

  nextEnter() {
    this.currentSprite = this.nextSprite
    this.genNext()
    this.currentSprite.x = Math.round(this.stageGrid.numOfCols / 2 - 1)
    this.currentSprite.y = -2
    this.stageGrid.putSprite(this.currentSprite)
  }

  moveX(steps = 1) {
    this.currentSprite.x += steps
    while (this.checkCollision()) {
      this.currentSprite.x += steps > 0 ? -1 : 1
    }
    this.stageGrid.clearGrid()
    this.stageGrid.putSprite(this.currentSprite)
    this.stageGrid.drawGrid()
  }

  async moveY(steps = 1) {
    this.currentSprite.y += steps
    let stable = false
    while (this.checkCollision()) {
      this.currentSprite.y -= 1
      stable = true
    }
    this.stageGrid.clearGrid()
    this.stageGrid.putSprite(this.currentSprite, stable)
    this.stageGrid.drawGrid()
    if (stable === true) {
      await this.checkFullLine()
      if (this.currentSprite.y <= 0) {
        this.gameOver()
      }
      this.nextEnter()
      this.genNext()
    }
  }

  rotate() {
    this.currentSprite.frameIndex =
      (this.currentSprite.frameIndex + 1) %
      this.currentSprite.shape.frames.length
    if (this.checkCollision()) {
      this.currentSprite.frameIndex =
        (this.currentSprite.frameIndex -
          1 +
          this.currentSprite.shape.frames.length) %
        this.currentSprite.shape.frames.length
    }
    this.stageGrid.clearGrid()
    this.stageGrid.putSprite(this.currentSprite)
    this.stageGrid.drawGrid()
  }

  async checkFullLine() {
    let rowsToRemove = []
    for (let y = 0; y < this.stageGrid.rows.length; y++) {
      let row = this.stageGrid.rows[y]
      if (row.isFull()) {
        rowsToRemove.push(row)
      }
    }
    if (rowsToRemove.length > 0) {
      for (let row of rowsToRemove) {
        await this.removeRow(row)
      }
      const gain = Math.pow(rowsToRemove.length, 2) * 100
      this.score.addScore(gain)
      this.score.showScore()
      this.log(`+${gain}分`)
      if (this.score.getScore() > this.maxScore.getMaxScore()) {
        this.maxScore.setMaxScore(this.score.getScore())
        this.maxScore.showMaxScore()
      }
    }
  }

  async removeRow(row) {
    for (let cell of row.cells) {
      cell.blockEl.style.backgroundColor = ""
      await new Promise((resolver) => setTimeout(resolver, this.removeInterval))
    }
    for (let r = row.rowIndex; r > 0; r--) {
      for (let c = 0; c < row.cells.length; c++) {
        this.stageGrid.rows[r].cells[c].stable =
          this.stageGrid.rows[r - 1].cells[c].stable
      }
    }
    this.stageGrid.rows[0].cells.forEach((c) => (c.stable = ""))
    this.stageGrid.drawGrid()
  }

  gameOver() {
    this.stop()
    this.log(`游戏结束，总分${this.score.getScore()}!`)
    this.gameOverEl.style.visibility = "visible"
  }

  checkCollision() {
    let frame = this.currentSprite.getFrame()
    for (let y = 0; y < frame.points.length; y++) {
      for (let x = 0; x < frame.points[y].length; x++) {
        if (frame.points[y][x] === 1) {
          if (this.stageGrid.numOfRows <= y + this.currentSprite.y) return true
          if (this.stageGrid.numOfCols <= x + this.currentSprite.x) return true
          if (0 > x + this.currentSprite.x) return true
          if (0 > y + this.currentSprite.y) continue
          let cell =
            this.stageGrid.rows[y + this.currentSprite.y].cells[
              x + this.currentSprite.x
            ]
          if (cell.stable != 0) return true
        }
      }
    }
  }
}

window.game = new Game(
  document.querySelector("#stage"),
  document.querySelector("#next"),
  document.querySelector("#score"),
  document.querySelector("#start"),
  document.querySelector("#gameover"),
  document.querySelector("#control"),
  document.querySelector("#maxScore"),
  document.querySelector("#log")
)
