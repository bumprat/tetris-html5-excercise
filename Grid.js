class Grid {
  rows = [new GridRow()]
  numOfCols = 20
  numOfRows = 30
  el = document.createElement("div")
  constructor(el, numOfRows = 30, numOfCols = 20) {
    this.el = el
    this.numOfRows = numOfRows
    this.numOfCols = numOfCols
  }

  build() {
    this.rows.length = 0
    this.el.replaceChildren()
    for (let rowIndex = 0; rowIndex < this.numOfRows; rowIndex++) {
      const rowEl = document.createElement("div")
      let gridRow = new GridRow(rowEl, rowIndex)
      for (let columnIndex = 0; columnIndex < this.numOfCols; columnIndex++) {
        gridRow.push(new GridCell())
      }
      this.el.append(rowEl)
      this.rows.push(gridRow)
    }
  }

  putSprite(sprite, stable = false) {
    let frame = sprite.getFrame()
    for (let yShape = 0; yShape < frame.points.length; yShape++) {
      for (let xShape = 0; xShape < frame.points[yShape].length; xShape++) {
        if (frame.points[yShape][xShape] === 1) {
          if (sprite.y + yShape < 0) continue
          let cell = this.rows[sprite.y + yShape].cells[sprite.x + xShape]
          if (stable) {
            cell.stable = sprite.shape.color
          } else {
            cell.pass = sprite.shape.color
          }
        }
      }
    }
  }

  clearGrid(clearAll = false) {
    this.rows.forEach((row) =>
      row.cells.forEach((cell) => {
        if (clearAll) {
          if (cell.stable !== "") cell.stable = ""
        }
        if (cell.pass !== "") cell.pass = ""
      })
    )
  }

  drawGrid() {
    this.rows.forEach((row) =>
      row.cells.forEach((cell) => {
        if (cell.pass !== "") {
          cell.blockEl.style.backgroundColor = cell.pass
          cell.blockEl.classList.add("bulge")
          return
        }
        if (cell.stable !== "") {
          cell.blockEl.style.backgroundColor = cell.stable
          cell.blockEl.classList.add("bulge")
          return
        }
        cell.blockEl.style.backgroundColor = ""
        cell.blockEl.classList.remove("bulge")
      })
    )
  }
}

class GridCell {
  stable = ""
  pass = ""
  cellEl = document.createElement("div")
  blockEl = document.createElement("div")

  constructor(stable = "", pass = "") {
    this.cellEl.classList.add("cell")
    this.blockEl.classList.add("block")
    this.stable = stable
    this.pass = pass
    this.cellEl.append(this.blockEl)
  }
}

class GridRow {
  cells = [new GridCell()]
  rowEl = document.createElement("div")
  rowIndex = 0

  constructor(rowEl, rowIndex) {
    this.cells.length = 0
    this.rowEl = rowEl || this.rowEl
    this.rowEl.classList.add("row")
    this.rowIndex = rowIndex || this.rowIndex
  }

  push(cell) {
    this.cells.push(cell)
    this.rowEl.append(cell.cellEl)
  }

  isFull() {
    return this.cells.every((c) => c.stable !== "")
  }
}
