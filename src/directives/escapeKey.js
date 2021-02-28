export default {
  beforeMount (el, binding, vnode) {
    el.escKeyupEvent = function (event) {
      if (event.keyCode === 27) binding.value(event, el)
    }
    document.body.addEventListener('keyup', el.escKeyupEvent)
  },
  unmounted (el) {
    document.body.removeEventListener('keyup', el.escKeyupEvent)
  }
}
