/* eslint-disable no-undef */
import { getRandomInt, scrollTo } from '../../../../js/utils/utils'

const Wheel = {
  config: {
    screenStart: document.querySelector('.wheel-container--start'),
    screenResult: document.querySelector('.wheel-container--result'),
    button: document.querySelector('.btn-rotate'),
    buttonAgain: document.querySelector('.btn-rotate-again'),
    drum: document.querySelector('.wheel-drum'),
    isRunning: false,
    startOffset: 0,
  },

  rotate() {
    const duration = 10
    const index = getRandomInt(1, 8)
    const section = 360 / 8
    const offset = (index - 1) * section + section / 2
    const rotate = 360 * duration + offset

    if (this.config.isRunning) return

    this.config.isRunning = true

    gsap.fromTo(this.config.drum, {
      rotate: this.config.startOffset,
    }, {
      rotate: rotate,
      duration: duration,
      ease: 'power2.inOut',
    })

    this.config.startOffset = rotate % 360

    setTimeout(() => {
      this.config.isRunning = false
      this.config.startOffset = 0
      this.toggleScreens(this.config.screenStart, this.config.screenResult, true)

      const scrollTargetPosition = document.querySelector('.section--wheel').getBoundingClientRect().top + window.scrollY + 160
      scrollTo(scrollTargetPosition)
    }, duration * 1000)
  },

  toggleScreens(first, second, showSpinner) {
    first.classList.add('hidden')
    if (showSpinner) {
      const spinner = document.createElement('div')
      spinner.className = 'spinner'
      first.closest('.section').appendChild(spinner)
    }
    setTimeout(() => {
      first.classList.add('d-none')
      second.classList.remove('d-none')
      setTimeout(() => {
        second.classList.remove('hidden')
        if (showSpinner) {
          document.querySelector('.spinner').remove()
        }
      }, 400)
    }, 400)
  },

  init() {
    if (this.config.button) {
      this.config.button.addEventListener('click', () => {
        const scrollTargetPosition = document.querySelector('.wheel-image').getBoundingClientRect().top + window.scrollY - 140
        scrollTo(scrollTargetPosition)
        this.rotate()
        this.config.button.disabled = true
      })
    }

    if (this.config.buttonAgain) {
      this.config.buttonAgain.addEventListener('click', () => {
        this.toggleScreens(this.config.screenResult, this.config.screenStart)
        this.config.button.parentNode.classList.add('d-none')

        setTimeout(() => {
          const scrollTargetPosition = document.querySelector('.wheel-image').getBoundingClientRect().top + window.scrollY - 140
          scrollTo(scrollTargetPosition)
          this.rotate()
        }, 800)
      })
    }
  }
}

export default Wheel
