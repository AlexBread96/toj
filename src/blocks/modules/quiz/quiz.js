/* eslint-disable no-undef */
import { scrollTo } from '../../../js/utils/utils'

const Quiz = window.Quiz = {
  config: {
    body: document.body,
    screenQuiz: document.querySelector('.quizz-container--quiz'),
    screenResult: document.querySelector('.quizz-container--result'),
    sliderEl: document.querySelector('.quizz-slider'),
    slider: null,
    elements: document.querySelectorAll('.quizz-vars-item input[type="radio"]'),
    progress: document.querySelector('.quizz-progress .progress'),
    bar: document.querySelector('.quizz-progress .bar'),
    offsetProperty: '--offset',
    animatedClass: 'animated',
    hiddenClass: 'hidden',
    processClass: 'page-quiz-process',
  },

  setOffset(el, counter, count) {
    const offset = Math.PI * (380 - 57) * ((100 - counter * 100 / count) / 100)
    el.style.setProperty(this.config.offsetProperty, offset + 'px')
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
    const count = this.config.sliderEl.querySelectorAll('.quizz-item').length
    let inProgress = false

    if (this.config.slider) {
      this.reset()
    }

    if (!this.config.screenResult.classList.contains('d-none')) {
      this.toggleScreens(this.config.screenResult, this.config.screenQuiz, true)
      if (window.innerWidth < 744) {
        document.querySelector('.section--quiz .fp-slides').style.height = this.config.screenQuiz.closest('.fp-slide').offsetHeight + 'px'
      }
    }

    this.initSlider()
    const swiper = this.config.sliderEl.swiper
    this.config.body.classList.add(this.config.processClass)

    Array.prototype.slice.call(this.config.elements).forEach((el) => {
      el.addEventListener('click', (event) => {
        if (inProgress) {
          event.preventDefault()
        }
      })

      el.addEventListener('change', (event) => {
        if (inProgress || swiper.destroyed) {
          event.preventDefault()
          return
        }

        this.config.sliderEl.classList.add('disabled')
        inProgress = true

        if (swiper.activeIndex + 1 < count) {
          setTimeout(() => {
            this.config.sliderEl.classList.remove('disabled')
            if (this.config.progress) {
              this.setOffset(this.config.bar, swiper.activeIndex + 1, count)
            }
            swiper.slideNext()
            inProgress = false
          }, 350)
        } else {
          this.config.body.classList.remove(this.config.processClass)
          if (this.config.progress) {
            this.config.progress.classList.add(this.config.animatedClass)
            this.setOffset(this.config.bar, swiper.activeIndex + 1, count)
          }

          this.config.sliderEl.classList.add(this.config.hiddenClass)
          const waiter = document.createElement('div')
          waiter.className = 'quizz-waiter'
          waiter.textContent = 'Секунду, мы считаем твой результат! Пока можешь немного позаниматься творожной аэробикой.'
          this.config.sliderEl.parentNode.appendChild(waiter)

          setTimeout(() => {
            document.querySelector('.quizz-waiter').classList.add('show')
          }, 350)

          setTimeout(() => {
            this.config.sliderEl.classList.remove('disabled')
            this.toggleScreens(this.config.screenQuiz, this.config.screenResult, true)
            inProgress = false
            const scrollTargetPosition = document.querySelector('.section--quiz').getBoundingClientRect().top + window.scrollY
            scrollTo(scrollTargetPosition)

            setTimeout(() => {
              if (window.innerWidth < 744) {
                document.querySelector('.section--quiz .fp-slides').style.height = this.config.screenResult.closest('.fp-slide').offsetHeight + 'px'
              }
            }, 500)
          }, 4000)
        }
      })
    })
  },

  initSlider() {
    this.config.slider = new Swiper(this.config.sliderEl, {
      allowTouchMove: false,
      autoHeight: true,
      pagination: {
        el: '.quizz-pages',
        type: 'fraction',
      },
    })
  },

  reset() {
    Array.prototype.slice.call(this.config.elements).forEach((el) => {
      el.checked = false
    })

    if (this.config.progress) {
      this.config.progress.classList.remove(this.config.animatedClass)
      this.config.bar.style.removeProperty(this.config.offsetProperty)
    }

    if (this.config.sliderEl.swiper) {
      const waiter = document.querySelector('.quizz-waiter')
      if (waiter) {
        waiter.remove()
      }
      this.config.sliderEl.swiper.destroy()
      this.config.sliderEl.classList.remove(this.config.hiddenClass)
      this.config.slider = null
    }
  },
}

export default Quiz
