<template>
  <transition
    enter-active-class="transition-opacity duration-1000"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-1000"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div
      v-if="!onlyDefaultInBcs"
      class="relative z-50 select-none text-leanix-gray-dark flex items-center border border-leanix-gray-dropdown"
      :class="{
        'border-leanix-gray-lighter': selectedBcMap?.name.toLowerCase() === 'default'
      }"
      v-click-outside="() => { opened = false }"
      v-escape="() => { opened = false }">
      <button
        @click="opened = true"
        class="px-24px py-12px focus:outline-none flex items-center w-full transition-colors"
        :class="{
          'text-leanix-gray-lighter': selectedBcMap?.name.toLowerCase() === 'default'
        }">
        <span
          id="industry-selection"
          :selection="selectedBcMap?.name">
          {{selectedBcMap?.name.toLowerCase() === 'default' ? 'Choose industry' : selectedBcMap?.name || 'Choose industry'}}
        </span>
        <div class="flex-1"/>
        <arrow-triangle-icon class="w-2.5 h-2.5"/>
      </button>
      <transition
        enter-from-class="transform opacity-0"
        enter-active-class="transition ease-out duration-100"
        enter-to-class="transform opacity-100"
        leave-from-class="transform opacity-100"
        leave-active-class="transition ease-in duration-75"
        leave-to-class="transform opacity-0">
        <div
          v-if="opened"
          class="absolute top-0 inset-x-0 bg-white flex items-center justify-between border border-leanix-gray-dropdown rounded-t text-xs -m-px">
          <div
            class="w-full flex items-center cursor-pointer">
            <input
              v-model="searchQuery"
              @keyup.enter="inputKeyupHandler"
              type="text"
              class="px-24px py-12px focus:outline-none w-full"
              :placeholder="selectedBcMap?.name"
              ref="searchInput">
          </div>
          <div
            class="absolute bottom-0 transform translate-y-full inset-x-0 bg-white border border-leanix-gray-dropdown rounded-b -mx-px shadow-xl overflow-y-auto"
            style="max-height: 200px">
            <div
              v-for="{ item, refIndex } in ftsSearchResult"
              :key="refIndex"
              class="px-24px py-12px hover:bg-gray-100 transition-colors"
              :class="{
                'bg-leanix-gray-light cursor-default': item.id === selectedBcMap.id,
                'cursor-pointer': item.id !== selectedBcMap.id
              }"
              @click="selectOption(item)">
              {{item.name}}
            </div>
            <div
              v-if="ftsSearchResult.length === 0"
              class="first:bg-leanix-gray-light px-24px py-12px hover:bg-gray-100 transition-colors cursor-pointer">
              No results...
            </div>
          </div>
          <button
            class="px-24px py-12px"
            @click="opened = false">
            <arrow-triangle-icon
              class="w-2.5 h-2.5 transition-transform"/>
          </button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import Fuse from 'fuse.js'
import ArrowTriangleIcon from '@/components/ArrowTriangleIcon.vue'
import ClickOutside from '@/directives/clickOutside'
import Escape from '@/directives/escapeKey'
export default {
  components: {
    ArrowTriangleIcon
  },
  directives: {
    ClickOutside,
    Escape
  },
  props: {
    bcMaps: {
      type: Array,
      required: true
    },
    selectedBcMap: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      opened: false,
      ftsIndex: new Fuse([], { minMatchCharLength: 1, threshold: 0.3, keys: ['name'] }),
      ftsSearchResult: [],
      searchQuery: ''
    }
  },
  watch: {
    bcMaps: {
      immediate: true,
      handler (value) {
        this.ftsIndex.setCollection(value)
      }
    },
    searchQuery (query) {
      if (!query) this.resetFtsSearchResults()
      else this.ftsSearchResult = this.ftsIndex.search(query)
    },
    async opened (state) {
      if (state && this.searchInput !== null) {
        this.searchQuery = ''
        this.resetFtsSearchResults()
        await this.$nextTick()
        this.$refs.searchInput.focus()
      }
    }
  },
  computed: {
    onlyDefaultInBcs () {
      return this.bcMaps.filter(({ name }) => name.toLowerCase() !== 'default').length === 0
    }
  },
  methods: {
    resetFtsSearchResults () {
      this.ftsSearchResult = this.bcMaps.map((item, refIndex) => ({ item, refIndex }))
    },
    selectOption (bcMap) {
      this.opened = false
      this.$emit('bc-map-selected', bcMap)
    },
    inputKeyupHandler () {
      const [option] = this.ftsSearchResult
      if (typeof option !== 'undefined') this.selectOption(JSON.parse(JSON.stringify(option.item)))
    }
  }
}
</script>
