const createGUI = require('../')
const createContext = require('pex-context')

const State = {
  rotation: 0,
  rotation2: 0
}

const range = {
  min: -Math.PI / 2,
  max: Math.PI / 2
}

const ctx = createContext()
const gui = createGUI(ctx)

const TEST = 4

switch (TEST) {
  case 0:
    // 1 tab + 1 column
    gui.addTab('1 tab + 1 column')
    gui.addColumn('Col 1')
    gui.addParam('Rotation', State, 'rotation', range)
    break
  case 1:
    // 1 tab + No column
    gui.addTab('1 tab + No column')
    gui.addParam('Rotation', State, 'rotation2', range)
    break
  case 2:
    // 2 tabs + 2 columns
    gui.addTab('2 tabs + 2 columns')
    gui.addColumn('Col 1')
    gui.addParam('Rotation', State, 'rotation', range)

    gui.addTab('2 tabs + 2 columns')
    gui.addColumn('Col 2')
    gui.addParam('Rotation 2', State, 'rotation2', range)
    break
  case 3:
    // 2 tabs + 1 columns first
    gui.addTab('2 tabs + 1 columns first')
    gui.addColumn('Col 1')
    gui.addParam('Rotation', State, 'rotation', range)

    gui.addTab('2 tabs + 1 columns first')
    gui.addParam('Rotation 2', State, 'rotation2', range)
    break
  case 4:
    // 2 tabs + 1 columns second
    gui.addTab('2 tabs + 1 columns second')
    gui.addParam('Rotation', State, 'rotation', range)

    gui.addTab('2 tabs + 1 columns second')
    gui.addColumn('Col 1')
    gui.addParam('Rotation 2', State, 'rotation2', range)
    break
  case 5:
    // 2 tabs + no columns
    gui.addTab('2 tabs + no columns')
    gui.addParam('Rotation', State, 'rotation', range)

    gui.addTab('2 tabs + no columns')
    gui.addParam('Rotation 2', State, 'rotation2', range)
    break

  default:
    break
}

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.92, 0.2, 0.2, 1],
    clearDepth: 1
  })
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  gui.draw()
})
