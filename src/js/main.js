import Common from './common/common'
import Header from '../blocks/modules/header/header'
import Quiz from '../blocks/modules/quiz/quiz'
import Wheel from '../blocks/modules/sections/wheel/wheel'

document.addEventListener('DOMContentLoaded', function() {
  Common.init()
  Header.init()
  window.Quiz = Quiz
  Wheel.init()
})
