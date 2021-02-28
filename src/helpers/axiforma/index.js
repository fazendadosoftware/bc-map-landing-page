// https://stackoverflow.com/questions/57661092/jspdf-pubsub-error-no-unicode-cmap-for-font
import { jsPDF } from 'jspdf'
import AxiformaRegular from './Axiforma-Regular'
import AxiformaBold from './Axiforma-Bold'
import AxiformaExtraBold from './Axiforma-ExtraBold'

const fonts = [
  ['Axiforma-Regular.ttf', 'Axiforma-Regular', 'normal', AxiformaRegular],
  ['Axiforma-Bold.ttf', 'Axiforma-Bold', 'normal', AxiformaBold],
  ['Axiforma-ExtraBold.ttf', 'Axiforma-ExtraBold', 'normal', AxiformaExtraBold]
]

const callAddFont = function () {
  fonts
    .forEach(([filename, name, type, font]) => {
      this.addFileToVFS(filename, font)
      this.addFont(filename, name, type)
    })
}

jsPDF.API.events.push(['addFonts', callAddFont])
