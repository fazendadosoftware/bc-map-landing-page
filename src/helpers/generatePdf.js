import { jsPDF as JsPDF } from 'jspdf'
import '@/helpers/axiforma'
import leanixLogo from '@/assets/img/leanix-logo.png'
import icon1 from '@/assets/img/icons/best-practices-1.png'
import icon2 from '@/assets/img/icons/best-practices-2.png'
import icon3 from '@/assets/img/icons/best-practices-3.png'
import icon4 from '@/assets/img/icons/best-practices-4.png'
import icon5 from '@/assets/img/icons/best-practices-5.png'
import icon6 from '@/assets/img/icons/best-practices-6.png'
import icon7 from '@/assets/img/icons/best-practices-7.png'
import icon8 from '@/assets/img/icons/best-practices-8.png'
import bestPractices from '@/assets/data/bestPractices.json'

const bestPracticesIcons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8]

const isBoldOpen = (arrayLength, valueBefore = false) => {
  const isEven = arrayLength % 2 === 0
  const result = valueBefore !== isEven
  return result
}

const splitTextWidthBoldMarks = (doc, text = '', {
  fontSize = 16,
  lineSpacing = 8,
  x0 = 660,
  y0 = 101,
  width = 150
}) => {
  const startXCached = x0
  let boldOpen = false
  doc.setFontSize(fontSize)
  doc.splitTextToSize(text, width)
    .forEach((text, i) => {
      if (text) {
        const arrayOfNormalAndBoldText = text.split('**')
        //  console.log('ARRAY OF', arrayOfNormalAndBoldText)
        arrayOfNormalAndBoldText.forEach((textItems, j) => {
          doc.setFont(boldOpen ? 'Axiforma-Regular' : 'Axiforma-Bold')
          if (j % 2 === 0) doc.setFont(boldOpen ? 'Axiforma-Bold' : 'Axiforma-Regular')
          doc.setFontSize(fontSize)
          doc.text(textItems, x0, y0)
          // http://raw.githack.com/MrRio/jsPDF/master/docs/module-split_text_to_size.html#~getStringUnitWidth
          x0 = x0 + (doc.getStringUnitWidth(textItems) * fontSize) / (72 / 25.6)
        })
        boldOpen = isBoldOpen(arrayOfNormalAndBoldText.length, boldOpen)
        x0 = startXCached
        y0 += lineSpacing
      }
    })
  return { x: x0, y: y0 }
}

// https://github.com/MrRio/jsPDF/issues/819
const bestPracticesSectionGenerator = async doc => {
  const fontSize = 16
  const lineSpacing = 8
  let { title, description, paragraphs = [] } = bestPractices
  description = description.replace(/<\/?strong>/g, '**')
  const [x0, y0, w] = [685, 80, 150, 480]

  // doc.setFillColor('#eeeeee')
  // doc.rect(x0, y0, w, h, 'F')
  // TITLE
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(20)
  doc.setTextColor('#1F2F4B')
  doc.text(x0, y0 + lineSpacing, title.toUpperCase())
  let { y } = splitTextWidthBoldMarks(doc, description, { fontSize, lineSpacing, x0, y0: y0 + 7 + 14, width: w })

  // Paragraph indent
  y = y + lineSpacing * 1.5

  paragraphs
    .forEach(async ({ title, description }, i) => {
      const iconSize = 10
      doc.addImage(bestPracticesIcons[i], 'PNG', x0, y - iconSize / 2, iconSize, iconSize)
      const textWidth = w - 20
      doc.setFont('Axiforma-Bold')
      doc.text(x0 + iconSize * 1.5, y, title)
      y = y + lineSpacing;
      ({ y } = splitTextWidthBoldMarks(doc, description, { fontSize, lineSpacing, x0: x0 + iconSize * 1.5, y0: y, width: textWidth }))
      y = y + lineSpacing * 1.3
    })
}

const bcMapSectionGenerator = async (doc, businessCapabilities = []) => {
  let [x0, y0, w, h] = [30, 80, 640, 480]
  const colSpacing = 5
  const maxColumns = Math.min(12, Math.max(businessCapabilities.length, 6))
  const colWidth = (w - (maxColumns - 1) * colSpacing) / maxColumns
  // doc.setFillColor('#eeeeee')
  // doc.rect(x0, y0, w, h, 'F')

  const padding = 6
  const childContainerWidth = colWidth - 2 * padding
  const ys = []
  const xs = []

  const box = []
  const text = []
  const line = []

  // THIS ITERATION DRAWS THE COLUMN CONTAINERS AND HEADERS
  for (const i of Array(Math.min(maxColumns, businessCapabilities.length)).keys()) {
    const { name = '', backgroundColor } = businessCapabilities[i] || {}
    // COLUMN BOX
    const x0Col = x0 + i * (colWidth + colSpacing)
    doc.setFillColor(backgroundColor)
    doc.roundedRect(x0Col, y0, colWidth, h, 1.6, 1.6, 'F')

    // BC NAME
    let y = y0 + 2 * padding
    const childTitleFontSize = 16
    const childTitleLineSpacing = 8
    doc.setFont('Axiforma-Bold')
    doc.setFontSize(childTitleFontSize)
    doc.splitTextToSize(name.toUpperCase(), childContainerWidth)
      .forEach(line => {
        const txtWidth = (doc.getStringUnitWidth(line) * childTitleFontSize) / (72 / 25.6)
        const x = x0Col + padding + (childContainerWidth - txtWidth) / 2
        text.push({ x, y, text: line, font: doc.getFont().fontName, fontSize: doc.getFontSize(), textColor: '#ffffff' })
        y = y + childTitleLineSpacing
      })
    ys[i] = y
    xs[i] = x0Col + padding
  }

  // SPACING BETWEEN THE TALLEST HEADER AND CHILD CONTAINERS
  y0 = Math.max(...ys) + padding
  // THIS ITERATION DRAWS THE CHID CONTAINERS
  for (const i of Array(Math.min(maxColumns, businessCapabilities.length)).keys()) {
    const { backgroundColor, children = [] } = businessCapabilities[i] || {}
    const x0 = xs[i]
    let y = y0

    // doc.setFillColor('#ff0000')
    // doc.roundedRect(x0, y0, childContainerWidth, 10, 1.6, 1.6, 'F')
    const fontSize = 10

    doc.setFontSize(fontSize)

    children.forEach(child => {
      const childY0 = y - padding / 2
      const { name, children: grandChildren = [] } = child
      doc.setFont('Axiforma-Bold')
      doc.splitTextToSize(name, childContainerWidth)
        .forEach(line => {
          y += padding / 2
          const txtWidth = (doc.getStringUnitWidth(line) * fontSize) / (72 / 25.6)
          const x = x0 + (childContainerWidth - txtWidth) / 2
          text.push({ x, y, text: line, font: doc.getFont().fontName, fontSize: doc.getFontSize(), textColor: '#1F2F4B' })
        })
      y += padding / 2
      line.push([x0, y, x0 + childContainerWidth, y, backgroundColor])
      y += padding / 4

      doc.setFont('Axiforma-Regular')
      grandChildren
        .forEach(({ name }, i) => {
          const isLast = i === grandChildren.length - 1
          doc.splitTextToSize(name, childContainerWidth)
            .forEach(line => {
              y += padding / 2
              const txtWidth = (doc.getStringUnitWidth(line) * fontSize) / (72 / 25.6)
              const x = x0 + (childContainerWidth - txtWidth) / 2
              text.push({ x, y, text: line, font: doc.getFont().fontName, fontSize: doc.getFontSize(), textColor: '#1F2F4B' })
            })
          if (!isLast) {
            y += padding / 2
            line.push([x0, y, x0 + childContainerWidth, y, '#e5e7eb'])
            y += padding / 4
          }
        })
      y += padding
      box.push([x0, childY0, childContainerWidth, y - childY0 - padding / 2])
    })
  }

  doc.setFillColor('#ffffff')
  box.forEach(([x0, y0, w, h]) => doc.roundedRect(x0, y0, w, h, 1.6, 1.6, 'F'))

  line
    .forEach(([x1, y1, x2, y2, drawColor]) => { doc.setDrawColor(drawColor); doc.line(x1, y1, x2, y2) })

  text
    .forEach(({ x, y, text, font, fontSize, textColor }) => {
      doc.setFont(font)
      doc.setFontSize(fontSize)
      doc.setTextColor(textColor)
      doc.text(x, y, text)
    })
}

export const generatePdf = async (selectedBcMap = null) => {
  if (selectedBcMap === null) return
  // eslint-disable-next-line
  const { name, children: businessCapabilities = [] } = selectedBcMap
  const [pageWidth, pageHeight] = [842, 597]
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: [pageWidth, pageHeight] })

  // TITLE PLACEHOLDER
  // doc.setFillColor('#eeeeee')
  // doc.rect(30, 30, 400, 30, 'F')
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(22)
  doc.setTextColor('#266ab9')
  doc.text(30, 30, 'BEST PRACTICES TO DEFINE')
  doc.setFontSize(50)
  doc.setTextColor('#1F2F4B')
  doc.text(30, 50, 'Business Capability Maps')

  // LOGO PLACEHOLDER
  // doc.setFillColor('#eeeeee')
  // doc.rect(670, 30, 140, 30, 'F')
  // TODO: fix logo image
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(50)
  doc.setTextColor('#1F2F4B')
  doc.text(745, 45, 'LeanIX')
  const logoImgWidth = 32
  const logoImgHeight = (10 / 15) * logoImgWidth
  doc.addImage(leanixLogo, 'PNG', 745 - logoImgWidth - 5, 45 - logoImgHeight + 3.7, logoImgWidth, logoImgHeight)

  // BC MAP PLACEHOLDER
  bcMapSectionGenerator(doc, businessCapabilities)

  // BEST PRACTICES PLACEHOLDER
  bestPracticesSectionGenerator(doc)

  // LEANIX.NET
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(18)
  doc.setTextColor('#1F2F4B')
  doc.text(pageWidth - 90, pageHeight - 12, 'www.leanix.net')

  // FOOTER BLUE RIBBON
  doc.setFillColor('#B6CEED')
  doc.rect(0, 592, 842, 5, 'F')
  const output = doc.output('blob')
  return output
  // doc.save(`${name}.pdf`)
}

export default generatePdf
