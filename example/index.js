const createGUI = require('../')

const load = require('pex-io/load')
const createContext = require('pex-context')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const mat4 = require('pex-math/mat4')
const quat = require('pex-math/quat')
const createTorus = require('primitive-torus')
const createCube = require('primitive-cube')
const isBrowser = require('is-browser')

const State = {
  currentRadioListChoice: 0,
  radioListChoices: ['Choice 1', 'Choice 2', 'Choice 3'].map((name, value) => ({
    name,
    value
  })),
  checkboxValue: false,
  message: 'Message',
  range: 0,
  position: [2, 0],
  rgba: [0.92, 0.2, 0.2, 1.0],
  hsb: [0.2, 0.92, 0.2, 1.0],
  textureParam: null,
  cubeTextureParam: null,
  currentTexture: 0,
  textures: []
}

const ExampleState = {
  scale: 1,
  rotate: false,
  time: 0,
  size: [1, 0.2],
  rotation: [0, 0, 0],
  bgColor: [0.92, 0.2, 0.2, 1.0],
  currentGeometry: 0,
  geometries: []
}

const vert = /* glsl */ `
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

const frag = /* glsl */ `
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

const gui = createGUI(ctx)

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [0, 0, -5],
  target: [0, 0, 0]
})

const orbiter = createOrbiter({ camera: camera })

function initGUI(res) {
  // Controls
  gui.addTab('Controls')
  gui.addColumn('Inputs')
  gui.addLabel('Special Parameters')
  gui.addButton('Button', () => {
    // eslint-disable-next-line no-console
    console.log('Called back')
  })
  gui.addRadioList(
    'Radio list',
    State,
    'currentRadioListChoice',
    State.radioListChoices
  )

  gui.addSeparator()
  gui.addLabel('Smart Parameters')
  gui.addParam('Checkbox', State, 'checkboxValue')
  gui.addParam('Text message', State, 'message', {}, function(value) {
    // eslint-disable-next-line no-console
    console.log(value)
  })
  gui.addParam('Slider', State, 'range', {
    min: -Math.PI / 2,
    max: Math.PI / 2
  })
  gui.addParam('Multi Slider', State, 'position', {
    min: 0,
    max: 10
  })

  gui.addColumn('Colors')
  gui.addParam('Color [RGBA]', State, 'rgba')
  gui.addParam('Color [HSB]', State, 'hsb', {
    type: 'color',
    palette2: res.palette
  })

  gui.addColumn('Textures')
  gui.addParam('Single', State, 'textureParam') // or gui.addTexture2D('Single', State.textures[1])
  gui.addTexture2DList(
    'List',
    State,
    'currentTexture',
    State.textures.map((tex, index) => ({ texture: tex, value: index }))
  )
  gui.addParam('Cube', State, 'cubeTextureParam') // or gui.addTextureCube('Cube', State.cubeTexture)

  gui.addColumn('Graphs')
  gui.addFPSMeeter()

  // Example
  gui.addTab('Example')
  gui.addColumn('Settings')
  gui.addParam('Scale', ExampleState, 'scale', { min: 0.1, max: 2 })
  gui.addParam('Rotate camera', ExampleState, 'rotate')
  gui.addParam('Rotation', ExampleState, 'rotation', {
    min: -Math.PI / 2,
    max: Math.PI / 2
  })
  gui.addHeader('Color')
  gui.addParam('BG Color [RGBA]', ExampleState, 'bgColor')
  gui.addParam('BG Color [HSB]', ExampleState, 'bgColor', {
    type: 'color',
    palette2: res.palette
  })

  gui.addColumn('Geometry')
  gui.addRadioList(
    'Type',
    ExampleState,
    'currentGeometry',
    ExampleState.geometries
  )
  gui.addParam('Torus Size', ExampleState, 'size', { min: 0.1, max: 2 }, () => {
    const torus = createTorus({
      majorRadius: ExampleState.size[0],
      minorRadius: ExampleState.size[1]
    })
    ctx.update(ExampleState.geometries[1].attributes.aPosition, {
      data: torus.positions
    })
  })

  gui.addColumn('Texture')
  gui.addTexture2D('Default', State.textures[1])
  gui.addTexture2DList(
    'Default',
    State,
    'currentTexture',
    State.textures.map(function(tex, index) {
      return { texture: tex, value: index }
    })
  )
}

const ASSET_DIR = isBrowser ? 'assets' : `${__dirname}/assets`

const resources = {
  palette: { image: ASSET_DIR + '/rainbow.jpg' },
  plask: { image: ASSET_DIR + '/plask.png' },
  pex: { image: ASSET_DIR + '/pex.png' },
  noise: { image: ASSET_DIR + '/noise.png' },
  posx: { image: ASSET_DIR + '/pisa/pisa_posx.jpg' },
  negx: { image: ASSET_DIR + '/pisa/pisa_negx.jpg' },
  posy: { image: ASSET_DIR + '/pisa/pisa_posy.jpg' },
  negy: { image: ASSET_DIR + '/pisa/pisa_negy.jpg' },
  posz: { image: ASSET_DIR + '/pisa/pisa_posz.jpg' },
  negz: { image: ASSET_DIR + '/pisa/pisa_negz.jpg' }
}

load(resources, (err, res) => {
  if (err) throw err

  State.textures = [
    ctx.texture2D({
      data: res.plask,
      width: res.plask.width,
      height: res.plask.height,
      flipY: true,
      wrap: ctx.Wrap.Repeat,
      encoding: ctx.Encoding.SRGB
    }),
    ctx.texture2D({
      data: res.pex,
      width: res.pex.width,
      height: res.pex.height,
      flipY: true,
      wrap: ctx.Wrap.Repeat,
      encoding: ctx.Encoding.SRGB
    }),
    ctx.texture2D({
      data: res.noise,
      width: res.noise.width,
      height: res.noise.height,
      flipY: true,
      wrap: ctx.Wrap.Repeat,
      encoding: ctx.Encoding.SRGB
    })
  ]

  State.cubeTexture = ctx.textureCube({
    data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
    width: 64,
    height: 64
  })
  State.textureParam = State.textures[0]
  State.cubeTextureParam = State.cubeTexture

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
    clearColor: ExampleState.bgColor,
    clearDepth: 1
  })
}

const cube = createCube()
ExampleState.geometries.push({
  name: 'Cube',
  value: 0,
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aTexCoord: ctx.vertexBuffer(cube.uvs)
  },
  indices: ctx.indexBuffer(cube.cells)
})

const torus = createTorus()
ExampleState.geometries.push({
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
ctx.frame(function frame() {
  ctx.debug(frameNumber++ === 10)
  ctx.submit(clearCmd)

  quat.setEuler(
    rotationQuat,
    ExampleState.rotation[0],
    ExampleState.rotation[1],
    ExampleState.rotation[2]
  )
  mat4.fromQuat(modelMatrix, rotationQuat)
  mat4.scale(modelMatrix, [
    ExampleState.scale,
    ExampleState.scale,
    ExampleState.scale
  ])

  if (ExampleState.rotate) {
    ExampleState.time += 1 / 60
    camera.set({
      position: [
        Math.cos(ExampleState.time * Math.PI) * 5,
        Math.sin(ExampleState.time * 0.5) * 3,
        Math.sin(ExampleState.time * Math.PI) * 5
      ]
    })
    orbiter.set({ camera: camera })
  }

  if (State.textures.length > 0) {
    ctx.submit(drawCmd, {
      attributes:
        ExampleState.geometries[ExampleState.currentGeometry].attributes,
      indices: ExampleState.geometries[ExampleState.currentGeometry].indices,
      uniforms: {
        uTexture: State.textures[State.currentTexture]
      }
    })
  }

  gui.draw()
})

const onResize = () => {
  const W = window.innerWidth
  const H = window.innerHeight
  ctx.set({
    width: W,
    height: H
  })
  camera.set({
    aspect: W / H
  })

  gui.scale = Math.min(Math.min(W / 800, H / 500), 1)
}

window.addEventListener('resize', onResize)

onResize()
