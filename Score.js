class MaxScore {
  el = document.createElement("div")

  setEl(el) {
    this.el = el
  }

  setMaxScore(score) {
    localStorage.setItem("maxScore", JSON.stringify(score))
  }

  showMaxScore() {
    this.el.innerHTML = this.getMaxScore().toString().padStart(7, "0")
  }

  getMaxScore() {
    let score = JSON.parse(localStorage.getItem("maxScore") || 0)
    return score
  }
}

class Score {
  score = 0
  el = document.createElement("div")

  setEl(el) {
    this.el = el
  }

  getScore() {
    return this.score
  }

  setScore(score) {
    this.score = score
  }

  addScore(score) {
    this.score += score
  }

  showScore() {
    this.el.innerHTML = this.score.toString().padStart(7, "0")
  }
}
