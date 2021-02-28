<template>
  <section
    class="absolute inset-y-0 right-0 pl-10 max-w-full flex z-50 text-leanix-gray-dark"
    aria-labelledby="slide-over-heading"
    v-click-outside="() => $emit('close')"
    v-escape="() => $emit('close')">
    <!--
      Slide-over panel, show/hide based on slide-over state.

      Entering: "transform transition ease-in-out duration-500 sm:duration-700"
        From: "translate-x-full"
        To: "translate-x-0"
      Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
        From: "translate-x-0"
        To: "translate-x-full"
    -->
    <transition
      enter-active-class="transform transition ease-in-out duration-500 sm:duration-700"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-500 sm:duration-700"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full">
      <div v-if="opened" class="w-screen max-w-md">
        <div class="h-full flex flex-col py-6 shadow-xl overflow-y-scroll" style="background: #fffffffB">
          <div class="px-4 sm:px-6">
            <div class="flex items-start justify-between">
              <h2 id="slide-over-heading" class="text-lg font-bold text-leanix-gray-darkest uppercase">
                {{title}}
              </h2>
              <div class="ml-3 h-7 flex items-center">
                <button
                  @click="$emit('close')"
                  class="bg-white rounded-md hover:text-gray-900 focus:outline-none focus:ring-0">
                  <span class="sr-only">Close panel</span>
                  <!-- Heroicon name: outline/x -->
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-6 relative flex-1 px-4 sm:px-6">
            <div class="p-2" v-html="description"/>
            <div class="flex flex-col space-y-6 py-6">
              <div
                v-for="({ title, description }, i) in paragraphs"
                :key="i"
                class="flex">
                <div class="px-2 mr-2">
                  <best-practices-icon class="w-5 h-5" :i="i"/>
                </div>
                <div class="">
                  <div class="font-bold">{{title}}</div>
                  <div>{{description}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
import ClickOutside from '@/directives/clickOutside'
import Escape from '@/directives/escapeKey'
import { title, description, paragraphs } from '@/assets/data/bestPractices.json'
import BestPracticesIcon from '@/components/BestPracticesIcon.vue'

export default {
  props: {
    opened: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  directives: {
    ClickOutside,
    Escape
  },
  components: {
    BestPracticesIcon
  },
  data () {
    return {
      title,
      description,
      paragraphs
    }
  }
}
</script>
