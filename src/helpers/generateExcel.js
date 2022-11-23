import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const fsHierarchySeparator = ' / '

const unrollChildren = (bc = null, i, relToParent = null, accumulator = []) => {
  if (bc === null) throw Error('Root BC is required!')
  const { name, children = null, backgroundColor = null } = bc
  accumulator.push({ hierarchy: i, name, relToParent, level: i.length, backgroundColor })
  relToParent = relToParent === null ? name : `${relToParent}${fsHierarchySeparator}${name}`
  if (children !== null) children.forEach((bc, j) => unrollChildren(bc, [...i, j + 1], relToParent, accumulator))
  return accumulator
}

const generateExcel = async (selectedBcMap = null) => {
  if (selectedBcMap === null) return
  const { name: industry, children: bcs } = selectedBcMap
  const unrolled = bcs
    .reduce((accumulator, bc, i) => {
      accumulator.push(...unrollChildren(bc, [i + 1], industry))
      return accumulator
    }, [{ type: 'BusinessCapability', name: industry, relToParent: null }])
  // extract the first node (rootNode) from the unrolled nodes
  const [, ...nodes] = unrolled
  const rows = nodes
    .sort(({ level: A }, { level: B }) => A > B ? 1 : A < B ? -1 : 0)
    .map(({ name, relToParent = '', backgroundColor = null, level }) => {
      relToParent = relToParent.split(fsHierarchySeparator).slice(1).join(fsHierarchySeparator)
      const row = { type: 'BusinessCapability', name, relToParent, level }
      if (backgroundColor !== null) row.description = JSON.stringify({ backgroundColor })
      return row
    })
  // rows.unshift({ id: 'ID', type: 'Type', name: 'Name', relToParent: 'Parent', description: 'Description' })
  rows.unshift({ id: 'ID', type: 'Type', name: 'Name', relToParent: 'Parent' })
  const workbook = new ExcelJS.Workbook()
  const sheetA = workbook.addWorksheet('Export 2021-02-17', { views: [{ state: 'frozen', ySplit: 2, xSplit: 3 }] })
  sheetA.columns = [
    { header: 'id', key: 'id', width: 5 },
    { header: 'type', key: 'type', width: 20 },
    { header: 'name', key: 'name', width: 40 },
    { header: 'relToParent', key: 'relToParent', width: 80 }
  ]
  sheetA.addRows(rows)
  sheetA.getRows(1, 2)
    .forEach(row => {
      row.font = { bold: true }
      row._cells.forEach(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } } })
    })
  const buf = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buf]), `LeanIX_Business-Capability-Map_${industry}.xlsx`)
}

export default generateExcel
