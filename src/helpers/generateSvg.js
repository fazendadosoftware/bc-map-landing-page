import { SVG } from '@svgdotjs/svg.js'
// import { axiformaRegular, axiformaBold, axiformaExtraBold } from './axiformaFonts'

function downloadString (text, fileType, fileName) {
  const blob = new Blob([text], { type: fileType })

  const a = document.createElement('a')
  a.download = fileName
  a.href = URL.createObjectURL(blob)
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(function () { URL.revokeObjectURL(a.href) }, 1500)
}

const generateSvg = (containerEl, selectedBcMap = null) => {
  if (selectedBcMap === null) return
  const { name } = selectedBcMap
  const headerHeight = 100
  const colsContainerEl = containerEl.querySelector('.bc-cols-container')
  const { scrollWidth: containerWidth, scrollHeight: containerHeight } = colsContainerEl
  const draw = SVG().addTo('body').size(containerWidth, containerHeight + headerHeight)
  // .bc-cols.container

  // draw.fontface('Axiforma-Regular', axiformaRegular)
  // draw.fontface('Axiforma-Bold', axiformaBold)
  // draw.fontface('Axiforma-ExtraBold', axiformaExtraBold)
  const selectedIndustry = containerEl.querySelector('#industry-selection').getAttribute('selection') || ''

  const headerGroup = draw.group()
  headerGroup
    .text('Business Capability Map')
    .font({ family: 'Arial', weight: 'bold', size: 30, anchor: 'middle' })
    .fill('#222f4b')
    .center(containerWidth / 2, 40)
  headerGroup
    .text(selectedIndustry)
    .font({ family: 'Arial', weight: 'bold', size: 24, anchor: 'middle' })
    .fill('#222f4b')
    .center(containerWidth / 2, 70)

  Array.from(colsContainerEl.querySelectorAll('.bc-col'))
    .forEach(colEl => {
      const { offsetLeft: x, offsetTop: y, scrollWidth: width, scrollHeight: height, style: { backgroundColor } } = colEl
      const colGroup = draw.group()
      colGroup.rect(width, height).fill(backgroundColor).radius(5).move(x, y + headerHeight)

      const { offsetLeft: xHeader, offsetTop: yHeader, scrollWidth: widthHeader, scrollHeight: heightHeader, innerText: colTitle } = colEl.querySelector('.bc-col-header')

      const font = { family: 'Arial', weight: 'bold', size: 19, anchor: 'middle' }

      const lines = colTitle.split(' ')
        .reduce((accumulator, word) => {
          let [width = 0, words = []] = accumulator.pop() || []
          const text = draw.text(word).font(font)
          const length = text.length()
          if ((width + length) < widthHeader) {
            width = width + length
            words.push(word)
            accumulator.push([width, words])
          } else {
            accumulator.push([width, words])
            accumulator.push([length, [word]])
          }
          draw.node.removeChild(text.node)
          return accumulator
        }, []).map(([_, words]) => words.join(' '))
      const colHeaderGroup = colGroup.group()
      const [cx, cy] = [x + xHeader + widthHeader / 2, y + yHeader + heightHeader / 2]
      // COL TITLE
      colHeaderGroup.text(add => lines.forEach(line => add.tspan(line).newLine()))
        .font(font)
        .fill('white')
        .center(cx, cy + headerHeight)

      // CHILDREN
      Array.from(colEl.querySelectorAll('.bc-child'))
        .forEach(childEl => {
          const { offsetLeft: x, offsetTop: y, scrollWidth: width, scrollHeight: height } = childEl
          const childGroup = colGroup.group()
          childGroup.rect(width, height).fill('white').radius(5).move(x, y + headerHeight)

          // CHILD HEADER
          const childHeaderEl = childEl.querySelector('.bc-child-header')
          const { offsetLeft: xHeader, offsetTop: yHeader, scrollWidth: widthHeader, scrollHeight: heightHeader, innerText: childName } = childHeaderEl
          childGroup.line(xHeader, yHeader + heightHeader + headerHeight, xHeader + widthHeader, yHeader + heightHeader + headerHeight).stroke({ color: backgroundColor, width: 2 })
          const font = { family: 'Arial', size: 11, weight: 'bold', anchor: 'middle' }
          const lines = childName.split(' ')
            .reduce((accumulator, word) => {
              let [width = 0, words = []] = accumulator.pop() || []
              const text = draw.text(word).font(font)
              const length = text.length()
              if ((width + length) < (widthHeader + 10)) {
                width = width + length
                words.push(word)
                accumulator.push([width, words])
              } else {
                accumulator.push([width, words])
                accumulator.push([length, [word]])
              }
              draw.node.removeChild(text.node)
              return accumulator
            }, []).map(([_, words]) => words.join(' '))
          const [cx, cy] = [xHeader + widthHeader / 2, yHeader + heightHeader / 2]
          childGroup.text(add => lines.forEach(line => add.tspan(line).newLine()))
            .font(font)
            .fill('#4D5C7D')
            .center(cx, cy + headerHeight)
            .attr('letter-spacing', '-0.5')

          // GRAND CHILDREN
          Array.from(childEl.querySelectorAll('.bc-grandchildren'))
            .forEach((grandChildEl, i, list) => {
              const { offsetLeft: x, offsetTop: y, scrollWidth: containerWidth, scrollHeight: containerHeight, innerText: grandChildName } = grandChildEl
              if (i < list.length - 1) childGroup.line(x, y + containerHeight + headerHeight, x + containerWidth, y + containerHeight + headerHeight).stroke({ color: '#757575', width: 0.5 })
              const [cx, cy] = [x + containerWidth / 2, y + containerHeight / 2]
              const font = { family: 'Arial', size: 11, anchor: 'middle' }
              const lines = grandChildName.split(' ')
                .reduce((accumulator, word) => {
                  let [width = 0, words = []] = accumulator.pop() || []
                  const text = draw.text(word).font(font)
                  const length = text.length()
                  if ((width + length) < (containerWidth - 12)) {
                    width = width + length
                    words.push(word)
                    accumulator.push([width, words])
                  } else {
                    accumulator.push([width, words])
                    accumulator.push([length, [word]])
                  }
                  draw.node.removeChild(text.node)
                  return accumulator
                }, []).map(([_, words]) => words.join(' '))
              childGroup.text(add => lines.forEach(line => add.tspan(line).newLine()))
                .font(font)
                .fill('#4D5C7D')
                .center(cx, cy + headerHeight)
                // .attr('letter-spacing', '-0.6')
            })
        })
    })
  downloadString(draw.svg(), 'image/svg+xml;charset=utf-8', `${name}.svg`)
  // REMOVE SVG NODE FROM BODY
  draw.parent().node.removeChild(draw.node)
}

export default generateSvg
