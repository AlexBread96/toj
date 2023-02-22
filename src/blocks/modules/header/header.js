/* eslint-disable no-undef */
const Header = {
  config: {
    body: document.body,
    nav: document.querySelector('#navigation'),
    navLinks: document.querySelectorAll('#menu .nav-link'),
    mql: window.matchMedia('(min-width: 744px)'),
  },

  navHide() {
    new bootstrap.Collapse(this.config.nav, {
      hide: true
    })
  },

  init() {
    if (!this.config.nav) {
      return
    }

    Array.prototype.slice.call(this.config.navLinks).forEach(link => {
      link.addEventListener('click', () => {
        if (!this.config.mql.matches) {
          this.navHide()
        }
      })
    })

    this.config.body.addEventListener('keyup', (event) => {
      if (this.config.nav.classList.contains('show') && event.key === 'Escape') {
        this.navHide()
      }
    })

    this.config.nav.addEventListener('show.bs.collapse', () => {
      this.config.nav.classList.add('show')
      this.config.body.classList.add('overflow-hidden')
    })

    this.config.nav.addEventListener('hide.bs.collapse', () => {
      this.config.body.classList.remove('overflow-hidden')
    })
  }
}

export default Header
