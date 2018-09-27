const mat4 = require('pex-math/mat4')
const quat = require('pex-math/quat')
const createTorus = require('primitive-torus')
const createCube = require('primitive-cube')
const createGUI = require('../../pex-gui')
const load = require('pex-io/load')
const createContext = require('pex-context')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const isBrowser = require('is-browser')

const State = {
  scale: 1,
  rotate: false,
  time: 0,
  size: [1, 0.2],
  rotation: [0, 0, 0],
  bgColor: [0.92, 0.2, 0.2, 1.0],
  textures: [],
  currentTexture: null,
  geometries: [],
  currentGeometry: 0,
  text: 'test message'
}

const vert = `
attribute vec2 aTexCoord;
attribute vec3 aPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`

const frag = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform vec2 uRepeat;
void main() {
  gl_FragColor = texture2D(uTexture, vTexCoord * uRepeat);
}`

const ctx = createContext({ pixelRatio: 2 })

let gui = createGUI(ctx)

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [0, 0, -5],
  target: [0, 0, 0]
})

const orbiter = createOrbiter({ camera: camera })

function initGUI (res) {
  gui.addTab('One')
  gui.addColumn('Settings')
  gui.addFPSMeeter()
  gui.addParam('Scale', State, 'scale', { min: 0.1, max: 2 })
  gui.addParam('Rotate camera', State, 'rotate')
  gui.addParam('Rotation', State, 'rotation', { min: -Math.PI / 2, max: Math.PI / 2 })
  gui.addSeparator()
  gui.addHeader('Color')
  gui.addParam('BG Color [RGBA]', State, 'bgColor')
  gui.addParam('BG Color [HSB]', State, 'bgColor', { type: 'color', palette2: res.palette })

  gui.addColumn('Geometry')
  gui.addRadioList('Type', State, 'currentGeometry', State.geometries)
  gui.addParam('Torus Size', State, 'size', { min: 0.1, max: 2 }, onTorusSizeChange)

  gui.addTab('Two')
  gui.addColumn('Texture')
  gui.addTexture2D('Default', State.textures[1])
  gui.addTexture2DList('Texture List', State, 'currentTexture', State.textures)

  gui.addColumn('Text')
  gui.addParam('Test message', State, 'text', {}, function (e) {
    console.log('New text: ', 'text')
  })
}

function onTorusSizeChange (value) {
  const torus = createTorus({ majorRadius: State.size[0], minorRadius: State.size[1] })
  ctx.update(State.geometries[1].attributes.aPosition, { data: torus.positions })
}

const ASSET_DIR = isBrowser ? 'assets' : `${__dirname}/assets`

const resources = {
  palette: { image: ASSET_DIR + '/rainbow.jpg' },
  plask: { image: ASSET_DIR + '/plask.png' },
  pex: { image: ASSET_DIR + '/pex.png' },
  noise: { image: ASSET_DIR + '/noise.png' }
}

load(resources, (err, res) => {
  if (err) console.log(err)

  State.textures = [
    ctx.texture2D({ data: res.plask, width: res.plask.width, height: res.plask.height, flipY: true, wrap: ctx.Wrap.Repeat, encoding: ctx.Encoding.SRGB }),
    ctx.texture2D({ data: res.pex, width: res.pex.width, height: res.pex.height, flipY: true, wrap: ctx.Wrap.Repeat, encoding: ctx.Encoding.SRGB }),
    ctx.texture2D({ data: res.noise, width: res.noise.width, height: res.noise.height, flipY: true, wrap: ctx.Wrap.Repeat, encoding: ctx.Encoding.SRGB })
  ]

  ctx.update(State.textures[0], {
    mipmap: true,
    min: ctx.Filter.LinearMipmapLinear,
    aniso: 16
    // wrap: ctx.Wrap.Clamp,
    // mag: ctx.Filter.Linear
  })
  initGUI(res)
})

const clearCmd = {
  pass: ctx.pass({
    clearColor: State.bgColor,
    clearDepth: 1
  })
}

const cube = createCube()
State.geometries.push({
  name: 'Cube',
  value: 0,
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aTexCoord: ctx.vertexBuffer(cube.uvs)
  },
  indices: ctx.indexBuffer(cube.cells)
})

const torus = createTorus()
State.geometries.push({
  name: 'Torus',
  value: 1,
  attributes: {
    aPosition: ctx.vertexBuffer(torus.positions),
    aTexCoord: ctx.vertexBuffer(torus.uvs)
  },
  indices: ctx.indexBuffer(torus.cells)
})

const modelMatrix = mat4.create()
const rotationQuat = quat.create()

const drawCmd = {
  name: 'drawCmd',
  pipeline: ctx.pipeline({
    vert: vert,
    frag: frag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: modelMatrix,
    uRepeat: [1, 1]
  }
}

let frameNumber = 0
ctx.frame(function frame () {
  ctx.debug(frameNumber++ === 10)
  ctx.submit(clearCmd)

  quat.setEuler(rotationQuat, State.rotation[0], State.rotation[1], State.rotation[2])
  mat4.fromQuat(modelMatrix, rotationQuat)
  mat4.scale(modelMatrix, [State.scale, State.scale, State.scale])

  if (State.rotate) {
    State.time += 1 / 60
    camera.set({ position: [
      Math.cos(State.time * Math.PI) * 5,
      Math.sin(State.time * 0.5) * 3,
      Math.sin(State.time * Math.PI) * 5
    ]})
    orbiter.set({ camera: camera })
  }

  if (State.textures.length > 0) {
    ctx.submit(drawCmd, {
      attributes: State.geometries[State.currentGeometry].attributes,
      indices: State.geometries[State.currentGeometry].indices,
      uniforms: {
        uTexture: State.currentTexture || State.textures[0]
      }
    })
  }

  if (gui) gui.draw()
})
