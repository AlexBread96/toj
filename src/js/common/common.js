/* eslint-disable no-undef */
import { scrollTo } from '../utils/utils'

const Common = {
  init() {
    // Getting real vh for mobile browsers
    (function() {
      const customViewportCorrectionVariable = 'vh'

      function setViewportProperty(doc) {
        const customVar = '--' + (customViewportCorrectionVariable || 'vh')
        let prevClientHeight

        function handleResize() {
          const clientHeight = doc.clientHeight
          if (clientHeight === prevClientHeight) return
          requestAnimationFrame(function updateViewportHeight() {
            doc.style.setProperty(customVar, (clientHeight * 0.01) + 'px')
            prevClientHeight = clientHeight
          })
        }
        handleResize()
        return handleResize
      }

      window.addEventListener('resize', setViewportProperty(document.documentElement))
    })();

    // Fullpage
    (function() {
      const scrollDown = document.querySelector('.btn-scroll')
      const buttonQuiz = document.querySelector('.btn-quiz')
      const slideToSection = document.querySelectorAll('[data-scrollto]')

      const fp = window.fp = new fullpage('#fullpage', {
        licenseKey: '73438E6B-32424808-B5E93D50-0E3A4BE3',
        responsiveWidth: 744,
        menu: '#menu',
        scrollOverflow: false,
        controlArrows: false,
        scrollingSpeed: 500,
        lazyLoading: false,
        credits: {
          enabled: false,
        },
        beforeLeave: function(origin, destination) {
          if (!scrollDown) return
          // scrollDown.classList.toggle('btn-scroll--texty', destination.anchor === 'whois')
          // scrollDown.classList.toggle('btn-light', destination.anchor !== 'whois')
          scrollDown.classList.toggle('invisible', destination.anchor === 'contacts')
        },
        onSlideLeave: function(section, origin, destination) {
          if (destination.anchor === 'quiz' && window.Quiz) {
            window.Quiz.init()
          }

          setTimeout(() => {
            if (window.innerWidth < 744) {
              document.querySelector('.section--quiz .fp-slides').style.height = destination.item.offsetHeight + 'px'
            }
          }, 0)
        },
      })

      fp.setAllowScrolling(false, 'left, right')
      fp.setKeyboardScrolling(false, 'left, right')

      if (scrollDown) {
        scrollDown.addEventListener('click', function() {
          fp.moveSectionDown()
        })
      }

      if (buttonQuiz) {
        buttonQuiz.addEventListener('click', function() {
          fp.moveSlideRight()
          const scrollTargetPosition = document.querySelector('.section--quiz').getBoundingClientRect().top + window.scrollY
          scrollTo(scrollTargetPosition)
        })
      }

      Array.prototype.slice.call(slideToSection).forEach(function(link) {
        link.addEventListener('click', function(event) {
          const anchor = event.target.getAttribute('data-scrollto') || 'hero'
          fp.moveTo(anchor)
        })
      })
    })();

    // Parallax
    (function() {
      const parallax = document.querySelector('.parallax')
      if (!parallax) return
      new Parallax(parallax)
    })();

    // Lightbox
    (function() {
      GLightbox({
        selector: '.glightbox',
      })
    })();
  }
}

export default Common
