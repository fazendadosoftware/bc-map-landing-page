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

let bestPracticesIcons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8]

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
  const lineSpacing = 7
  const fontSize = 14
  const [x0, y0, w] = [30, 515, 790, 60]
  let { title, description, paragraphs = [] } = bestPractices
  paragraphs = JSON.parse(JSON.stringify(paragraphs))
  bestPracticesIcons = JSON.parse(JSON.stringify(bestPracticesIcons))
  paragraphs.splice(4, 1)
  bestPracticesIcons.splice(4, 1)

  const sections = [{ title, description }, ...paragraphs]
  const sectionGap = 3
  const sectionWidth = (w - (sections.length - 1) * sectionGap) / sections.length
  sections
    .forEach((section, i) => {
      let { title, description } = section
      description = description.replace(/<\/?strong>/g, '**')
      const x = x0 + i * (sectionWidth + sectionGap)
      let y = y0
      if (i === 0) {
        doc.setFont('Axiforma-ExtraBold')
        doc.setFontSize(18)
        doc.setTextColor('#1F2F4B')
        doc.text(x, y + lineSpacing / 2, title.toUpperCase())
      } else {
        const iconSize = 8
        doc.addImage(bestPracticesIcons[i - 1], 'PNG', x, y - iconSize / 2, iconSize, iconSize)
      }
      y += 2 * lineSpacing
      if (i > 0) {
        doc.setFont('Axiforma-Bold')
        doc.text(x, y, title)
        y += lineSpacing
      }
      splitTextWidthBoldMarks(doc, description, { fontSize, lineSpacing, x0: x, y0: y, width: sectionWidth })
    })
}

const bcMapSectionGenerator = async (doc, businessCapabilities = [], defaultBackgroundColor = '#4D5C7D') => {
  let [x0, y0, w, h] = [30, 80, 790, 400]
  const colSpacing = 5
  const maxColumns = Math.min(12, Math.max(businessCapabilities.length, 6))
  const colWidth = (w - (maxColumns - 1) * colSpacing) / maxColumns

  const padding = 5.5
  const childContainerWidth = colWidth - 2 * padding
  const ys = []
  const xs = []

  const box = []
  const text = []
  const line = []

  // THIS ITERATION DRAWS THE COLUMN CONTAINERS AND HEADERS
  for (const i of Array(Math.min(maxColumns, businessCapabilities.length)).keys()) {
    const { name = '', backgroundColor = defaultBackgroundColor } = businessCapabilities[i] || {}
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
    doc.splitTextToSize(name.toUpperCase(), childContainerWidth - padding / 2)
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
    const { backgroundColor = defaultBackgroundColor, children = [] } = businessCapabilities[i] || {}
    const x0 = xs[i]
    let y = y0 - padding

    const fontSize = 10

    doc.setFontSize(fontSize)

    children.forEach(child => {
      y = y + padding / 2
      const childY0 = y
      const { name, children: grandChildren = [] } = child
      doc.setFont('Axiforma-Bold')
      doc.splitTextToSize(name, childContainerWidth - padding / 2)
        .forEach(line => {
          y += padding
          const txtWidth = (doc.getStringUnitWidth(line) * fontSize) / (72 / 25.6)
          const x = x0 + (childContainerWidth - txtWidth) / 2
          text.push({ x, y, text: line, font: doc.getFont().fontName, fontSize: doc.getFontSize(), textColor: '#1F2F4B' })
        })
      if (grandChildren.length) {
        y += padding / 2
        line.push([x0, y, x0 + childContainerWidth, y, backgroundColor, 0.4])
        y += padding / 4
        doc.setFont('Axiforma-Regular')
        grandChildren
          .forEach(({ name }, i) => {
            y -= padding / 4
            const isLast = i === grandChildren.length - 1
            doc.splitTextToSize(name, childContainerWidth - padding / 2)
              .forEach(line => {
                y += padding
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
      }
      y += padding
      box.push([x0, childY0, childContainerWidth, y - childY0 - padding / 2])
    })
  }

  doc.setFillColor('#ffffff')
  box.forEach(([x0, y0, w, h]) => doc.roundedRect(x0, y0, w, h, 1.6, 1.6, 'F'))

  line
    .forEach(([x1, y1, x2, y2, drawColor, width = 0.1]) => {
      doc.setDrawColor(drawColor)
      doc.setLineWidth(width)
      doc.line(x1 + 0.01, y1, x2 - 0.01, y2)
    })

  text
    .forEach(({ x, y, text, font, fontSize, textColor }) => {
      doc.setFont(font)
      doc.setFontSize(fontSize)
      doc.setTextColor(textColor)
      doc.text(x, y, text)
    })
}

export const generatePdf = async (selectedBcMap = null, defaultBackgroundColor = '#4D5C7D') => {
  if (selectedBcMap === null) return
  const { name, children: businessCapabilities = [] } = selectedBcMap
  const [pageWidth, pageHeight] = [842, 597]
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: [pageWidth, pageHeight] })

  // TITLE PLACEHOLDER
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(22)
  doc.setTextColor('#266ab9')
  doc.text(30, 30, 'BEST PRACTICES TO DEFINE')
  doc.setFontSize(50)
  doc.setTextColor('#1F2F4B')
  const title = 'Business Capability Map'
  const titleWidth = (doc.getStringUnitWidth(title) * 50) / (72 / 25.6)
  doc.text(30, 50, title)
  if (name.toLowerCase() !== 'default') {
    doc.setFontSize(30)
    doc.setTextColor('#8995AF')
    doc.text(30 + titleWidth, 50, ` for ${name} Industry`)
  }

  // LOGO PLACEHOLDER
  doc.setFont('Axiforma-ExtraBold')
  doc.setFontSize(50)
  doc.setTextColor('#1F2F4B')
  doc.text(745, 45, 'LeanIX')
  const logoImgWidth = 32
  const logoImgHeight = (10 / 15) * logoImgWidth
  doc.addImage(leanixLogo, 'PNG', 745 - logoImgWidth - 5, 45 - logoImgHeight + 3.7, logoImgWidth, logoImgHeight)

  // BC MAP PLACEHOLDER
  bcMapSectionGenerator(doc, businessCapabilities, defaultBackgroundColor)

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
