(function () {
  'use strict';

  function getRandomInt(min, max) {
    const minimum = Math.ceil(min);
    const maximum = Math.floor(max);
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }
  function scrollTo(yPos) {
    let duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
    const startY = window.scrollY;
    const difference = yPos - startY;
    const startTime = performance.now();
    step();
    function step() {
      const progress = (performance.now() - startTime) / duration;
      const amount = easeOutCubic(progress);
      window.scrollTo({
        top: startY + amount * difference
      });
      if (progress < .999) {
        window.requestAnimationFrame(step);
      }
    }
  }
  function easeOutCubic(t) {
    return --t * t * t + 1;
  }

  /* eslint-disable no-undef */
  const Common = {
    init() {
      // Getting real vh for mobile browsers
      (function () {
        const customViewportCorrectionVariable = 'vh';
        function setViewportProperty(doc) {
          const customVar = '--' + (customViewportCorrectionVariable );
          let prevClientHeight;
          function handleResize() {
            const clientHeight = doc.clientHeight;
            if (clientHeight === prevClientHeight) return;
            requestAnimationFrame(function updateViewportHeight() {
              doc.style.setProperty(customVar, clientHeight * 0.01 + 'px');
              prevClientHeight = clientHeight;
            });
          }
          handleResize();
          return handleResize;
        }
        window.addEventListener('resize', setViewportProperty(document.documentElement));
      })();

      // Fullpage
      (function () {
        const scrollDown = document.querySelector('.btn-scroll');
        const buttonQuiz = document.querySelector('.btn-quiz');
        const slideToSection = document.querySelectorAll('[data-scrollto]');
        const fp = window.fp = new fullpage('#fullpage', {
          licenseKey: '73438E6B-32424808-B5E93D50-0E3A4BE3',
          responsiveWidth: 744,
          menu: '#menu',
          scrollOverflow: false,
          controlArrows: false,
          scrollingSpeed: 500,
          lazyLoading: false,
          credits: {
            enabled: false
          },
          beforeLeave: function (origin, destination) {
            if (!scrollDown) return;
            // scrollDown.classList.toggle('btn-scroll--texty', destination.anchor === 'whois')
            // scrollDown.classList.toggle('btn-light', destination.anchor !== 'whois')
            scrollDown.classList.toggle('invisible', destination.anchor === 'contacts');
          },
          onSlideLeave: function (section, origin, destination) {
            if (destination.anchor === 'quiz' && window.Quiz) {
              window.Quiz.init();
            }
            setTimeout(() => {
              if (window.innerWidth < 744) {
                document.querySelector('.section--quiz .fp-slides').style.height = destination.item.offsetHeight + 'px';
              }
            }, 0);
          }
        });
        fp.setAllowScrolling(false, 'left, right');
        fp.setKeyboardScrolling(false, 'left, right');
        if (scrollDown) {
          scrollDown.addEventListener('click', function () {
            fp.moveSectionDown();
          });
        }
        if (buttonQuiz) {
          buttonQuiz.addEventListener('click', function () {
            fp.moveSlideRight();
            const scrollTargetPosition = document.querySelector('.section--quiz').getBoundingClientRect().top + window.scrollY;
            scrollTo(scrollTargetPosition);
          });
        }
        Array.prototype.slice.call(slideToSection).forEach(function (link) {
          link.addEventListener('click', function (event) {
            const anchor = event.target.getAttribute('data-scrollto') || 'hero';
            fp.moveTo(anchor);
          });
        });
      })();

      // Parallax
      (function () {
        const parallax = document.querySelector('.parallax');
        if (!parallax) return;
        new Parallax(parallax);
      })();

      // Lightbox
      (function () {
        GLightbox({
          selector: '.glightbox'
        });
      })();
    }
  };

  /* eslint-disable no-undef */
  const Header = {
    config: {
      body: document.body,
      nav: document.querySelector('#navigation'),
      navLinks: document.querySelectorAll('#menu .nav-link'),
      mql: window.matchMedia('(min-width: 744px)')
    },
    navHide() {
      new bootstrap.Collapse(this.config.nav, {
        hide: true
      });
    },
    init() {
      if (!this.config.nav) {
        return;
      }
      Array.prototype.slice.call(this.config.navLinks).forEach(link => {
        link.addEventListener('click', () => {
          if (!this.config.mql.matches) {
            this.navHide();
          }
        });
      });
      this.config.body.addEventListener('keyup', event => {
        if (this.config.nav.classList.contains('show') && event.key === 'Escape') {
          this.navHide();
        }
      });
      this.config.nav.addEventListener('show.bs.collapse', () => {
        this.config.nav.classList.add('show');
        this.config.body.classList.add('overflow-hidden');
      });
      this.config.nav.addEventListener('hide.bs.collapse', () => {
        this.config.body.classList.remove('overflow-hidden');
      });
    }
  };

  /* eslint-disable no-undef */
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
      processClass: 'page-quiz-process'
    },
    setOffset(el, counter, count) {
      const offset = Math.PI * (380 - 57) * ((100 - counter * 100 / count) / 100);
      el.style.setProperty(this.config.offsetProperty, offset + 'px');
    },
    toggleScreens(first, second, showSpinner) {
      first.classList.add('hidden');
      if (showSpinner) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        first.closest('.section').appendChild(spinner);
      }
      setTimeout(() => {
        first.classList.add('d-none');
        second.classList.remove('d-none');
        setTimeout(() => {
          second.classList.remove('hidden');
          if (showSpinner) {
            document.querySelector('.spinner').remove();
          }
        }, 400);
      }, 400);
    },
    init() {
      const count = this.config.sliderEl.querySelectorAll('.quizz-item').length;
      let inProgress = false;
      if (this.config.slider) {
        this.reset();
      }
      if (!this.config.screenResult.classList.contains('d-none')) {
        this.toggleScreens(this.config.screenResult, this.config.screenQuiz, true);
        if (window.innerWidth < 744) {
          document.querySelector('.section--quiz .fp-slides').style.height = this.config.screenQuiz.closest('.fp-slide').offsetHeight + 'px';
        }
      }
      this.initSlider();
      const swiper = this.config.sliderEl.swiper;
      this.config.body.classList.add(this.config.processClass);
      Array.prototype.slice.call(this.config.elements).forEach(el => {
        el.addEventListener('click', event => {
          if (inProgress) {
            event.preventDefault();
          }
        });
        el.addEventListener('change', event => {
          if (inProgress || swiper.destroyed) {
            event.preventDefault();
            return;
          }
          this.config.sliderEl.classList.add('disabled');
          inProgress = true;
          if (swiper.activeIndex + 1 < count) {
            setTimeout(() => {
              this.config.sliderEl.classList.remove('disabled');
              if (this.config.progress) {
                this.setOffset(this.config.bar, swiper.activeIndex + 1, count);
              }
              swiper.slideNext();
              inProgress = false;
            }, 350);
          } else {
            this.config.body.classList.remove(this.config.processClass);
            if (this.config.progress) {
              this.config.progress.classList.add(this.config.animatedClass);
              this.setOffset(this.config.bar, swiper.activeIndex + 1, count);
            }
            this.config.sliderEl.classList.add(this.config.hiddenClass);
            const waiter = document.createElement('div');
            waiter.className = 'quizz-waiter';
            waiter.textContent = 'Секунду, мы считаем твой результат! Пока можешь немного позаниматься творожной аэробикой.';
            this.config.sliderEl.parentNode.appendChild(waiter);
            setTimeout(() => {
              document.querySelector('.quizz-waiter').classList.add('show');
            }, 350);
            setTimeout(() => {
              this.config.sliderEl.classList.remove('disabled');
              this.toggleScreens(this.config.screenQuiz, this.config.screenResult, true);
              inProgress = false;
              const scrollTargetPosition = document.querySelector('.section--quiz').getBoundingClientRect().top + window.scrollY;
              scrollTo(scrollTargetPosition);
              setTimeout(() => {
                if (window.innerWidth < 744) {
                  document.querySelector('.section--quiz .fp-slides').style.height = this.config.screenResult.closest('.fp-slide').offsetHeight + 'px';
                }
              }, 500);
            }, 4000);
          }
        });
      });
    },
    initSlider() {
      this.config.slider = new Swiper(this.config.sliderEl, {
        allowTouchMove: false,
        autoHeight: true,
        pagination: {
          el: '.quizz-pages',
          type: 'fraction'
        }
      });
    },
    reset() {
      Array.prototype.slice.call(this.config.elements).forEach(el => {
        el.checked = false;
      });
      if (this.config.progress) {
        this.config.progress.classList.remove(this.config.animatedClass);
        this.config.bar.style.removeProperty(this.config.offsetProperty);
      }
      if (this.config.sliderEl.swiper) {
        const waiter = document.querySelector('.quizz-waiter');
        if (waiter) {
          waiter.remove();
        }
        this.config.sliderEl.swiper.destroy();
        this.config.sliderEl.classList.remove(this.config.hiddenClass);
        this.config.slider = null;
      }
    }
  };

  /* eslint-disable no-undef */
  const Wheel = {
    config: {
      screenStart: document.querySelector('.wheel-container--start'),
      screenResult: document.querySelector('.wheel-container--result'),
      button: document.querySelector('.btn-rotate'),
      buttonAgain: document.querySelector('.btn-rotate-again'),
      drum: document.querySelector('.wheel-drum'),
      isRunning: false,
      startOffset: 0
    },
    rotate() {
      const duration = 10;
      const index = getRandomInt(1, 8);
      const section = 360 / 8;
      const offset = (index - 1) * section + section / 2;
      const rotate = 360 * duration + offset;
      if (this.config.isRunning) return;
      this.config.isRunning = true;
      gsap.fromTo(this.config.drum, {
        rotate: this.config.startOffset
      }, {
        rotate: rotate,
        duration: duration,
        ease: 'power2.inOut'
      });
      this.config.startOffset = rotate % 360;
      setTimeout(() => {
        this.config.isRunning = false;
        this.config.startOffset = 0;
        this.toggleScreens(this.config.screenStart, this.config.screenResult, true);
        const scrollTargetPosition = document.querySelector('.section--wheel').getBoundingClientRect().top + window.scrollY + 160;
        scrollTo(scrollTargetPosition);
      }, duration * 1000);
    },
    toggleScreens(first, second, showSpinner) {
      first.classList.add('hidden');
      if (showSpinner) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        first.closest('.section').appendChild(spinner);
      }
      setTimeout(() => {
        first.classList.add('d-none');
        second.classList.remove('d-none');
        setTimeout(() => {
          second.classList.remove('hidden');
          if (showSpinner) {
            document.querySelector('.spinner').remove();
          }
        }, 400);
      }, 400);
    },
    init() {
      if (this.config.button) {
        this.config.button.addEventListener('click', () => {
          const scrollTargetPosition = document.querySelector('.wheel-image').getBoundingClientRect().top + window.scrollY - 140;
          scrollTo(scrollTargetPosition);
          this.rotate();
          this.config.button.disabled = true;
        });
      }
      if (this.config.buttonAgain) {
        this.config.buttonAgain.addEventListener('click', () => {
          this.toggleScreens(this.config.screenResult, this.config.screenStart);
          this.config.button.parentNode.classList.add('d-none');
          setTimeout(() => {
            const scrollTargetPosition = document.querySelector('.wheel-image').getBoundingClientRect().top + window.scrollY - 140;
            scrollTo(scrollTargetPosition);
            this.rotate();
          }, 800);
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    Common.init();
    Header.init();
    window.Quiz = Quiz;
    Wheel.init();
  });

})();
