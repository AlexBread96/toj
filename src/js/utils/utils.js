export function debounce(fn, delay) {
  let timeout
  return function(...args) {
    if (delay) {
      clearTimeout(timeout)
      timeout = setTimeout(fn, delay, args)
    } else {
      fn.apply(this, args)
    }
    return delay
  }
}

export function throttle(fn, delay) {
  let timeout = null
  return function(...args) {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn.call(this, ...args)
        timeout = null
      }, delay)
    }
  }
}

export function isSafari() {
  return (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1)
}

export function isMobile() {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth < 768)
}

export function isFirefox() {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
}

export function getRandomInt(min, max) {
  const minimum = Math.ceil(min)
  const maximum = Math.floor(max)
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

export function scrollTo(yPos, duration = 500) {
  const startY = window.scrollY
  const difference = yPos - startY
  const startTime = performance.now()

  step()

  function step() {
    const progress = (performance.now() - startTime) / duration
    const amount = easeOutCubic(progress)

    window.scrollTo({ top: startY + amount * difference })

    if (progress < .999) {
      window.requestAnimationFrame(step)
    }
  }
}

function easeOutCubic(t) {
  return --t * t * t + 1
}
