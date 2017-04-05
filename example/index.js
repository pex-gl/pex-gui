const Mat4 = require('pex-math/Mat4')
const createTorus = require('primitive-torus')
const createCube = require('primitive-cube')
const GUI = require('../../pex-gui')
const load = require('pex-io/load')
const createContext = require('pex-context')
const raf = require('raf')
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
  currentTexture: 0,
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

const ctx = createContext()

const gui = new GUI(ctx)

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
  gui.addHeader('Settings')
  gui.addParam('Scale', State, 'scale', { min: 0.1, max: 2 })
  gui.addParam('Rotate camera', State, 'rotate')
  gui.addParam('Rotation', State, 'rotation', { min: -Math.PI / 2, max: Math.PI / 2 })
  gui.addSeparator()
  gui.addHeader('Color')
  gui.addParam('BG Color [RGBA]', State, 'bgColor')
  gui.addParam('BG Color [HSB]', State, 'bgColor', { type: 'color', palette: res.palette })

  gui.addHeader('Geometry').setPosition(180, 10)
  gui.addRadioList('Type', State, 'currentGeometry', State.geometries)
  gui.addParam('Torus Size', State, 'size', { min: 0.1, max: 2 }, onTorusSizeChange)

  // this.gui.addSeparator()
  gui.addSeparator()
  gui.addHeader('Texture')
  gui.addTexture2D('Default', State.textures[0])
  gui.addTexture2DList('Default', State, 'currentTexture', State.textures.map(function (tex, index) {
    return { texture: tex, value: index }
  }))

  gui.addHeader('Text').setPosition(360, 10)
  gui.addParam('Test message', State, 'text', {}, function (e) {
    console.log('New text: ', 'text')
  })
}

function onTorusSizeChange (value) {
  const torus = createTorus({ majorRadius: State.size[0], minorRadius: State.size[1] })
  ctx.update(State.geometries[1].attributes.aPosition, { data: torus.positions })
}

const ASSET_DIR = isBrowser ? 'assets' : __dirname + '/assets'

const resources = {
  palette: { image: ASSET_DIR + '/rainbow.jpg' },
  plask: { image: ASSET_DIR + '/plask.png' },
  pex: { image: ASSET_DIR + '/pex.png' },
  noise: { image: ASSET_DIR + '/noise.png' }
}

load(resources, (err, res) => {
  if (err) console.log(err)

  State.textures = [
    ctx.texture2D({ data: res.plask, flipY: true, wrap: ctx.Wrap.Repeat }),
    ctx.texture2D({ data: res.pex, flipY: true, wrap: ctx.Wrap.Repeat }),
    ctx.texture2D({ data: res.noise, flipY: true, wrap: ctx.Wrap.Repeat })
  ]
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

const modelMatrix = Mat4.create()

const drawCmd = {
  name: 'drawCmd',
  pipeline: ctx.pipeline({
    vert: vert,
    frag: frag,
    depthEnabled: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: modelMatrix,
    uRepeat: [2, 2]
  }
}

let frameNumber = 0
raf(function frame () {
  ctx.debug(frameNumber++ === 10)
  ctx.submit(clearCmd)

  Mat4.identity(modelMatrix)
  Mat4.rotateXYZ(modelMatrix, State.rotation)
  Mat4.scale3(modelMatrix, State.scale, State.scale, State.scale)

  if (State.rotate) {
    State.time += 1 / 60
    camera({ position: [
      Math.cos(State.time * Math.PI) * 5,
      Math.sin(State.time * 0.5) * 3,
      Math.sin(State.time * Math.PI) * 5
    ]})
    orbiter({ camera: camera })
  }
  
  if (State.textures.length > 0) {
    ctx.submit(drawCmd, {
      attributes: State.geometries[State.currentGeometry].attributes,
      indices: State.geometries[State.currentGeometry].indices,
      uniforms: {
        uTexture: State.textures[State.currentTexture]
      }
    })
  }

  gui.draw()
  raf(frame)
})

/*
Window.create({
  settings: {
    type: '3d',
    width: 1280,
    height: 720
  },
  resources: {
  },
  init: function () {
    this.addEventListener(this.gui)

    this.model = Mat4.create()
    this.projection = Mat4.perspective(Mat4.create(), 45, this.getAspectRatio(), 0.001, 10.0)
    this.view = Mat4.lookAt([], [3, 2, 2], [0, 0, 0], [0, 1, 0])

    ctx.setProjectionMatrix(this.projection)
    ctx.setViewMatrix(this.view)
    ctx.setModelMatrix(this.model)

    this.program = ctx.createProgram(res.vert, res.frag)
    ctx.bindProgram(this.program)
    this.program.setUniform('uRepeat', [ 8, 8 ])
    this.program.setUniform('uTexture', 0)

    var torus = createTorus()

    var attributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
    ]
    var indices = { data: torus.cells, usage: ctx.STATIC_DRAW }
    this.mesh = ctx.createMesh(attributes, indices)

    var img = new Uint8Array([
      0xff, 0xff, 0xff, 0xff, 0xcc, 0xcc, 0xcc, 0xff,
      0xcc, 0xcc, 0xcc, 0xff, 0xff, 0xff, 0xff, 0xff
    ])

    State.textures.push(ctx.createTexture2D(img, 2, 2, {
      repeat: true,
      minFilter: ctx.NEAREST,
      magFilter: ctx.NEAREST
    }))

    State.textures.push(ctx.createTexture2D(res.plask, res.plask.width, res.plask.height, { repeat: true }))
    State.textures.push(ctx.createTexture2D(res.opengl, res.opengl.width, res.opengl.height, { repeat: true }))
    State.textures.push(ctx.createTexture2D(res.test, res.test.width, res.test.height, { repeat: true }))

  },
  onTorusSizeChange: function () {
    var ctx = this.getContext()
  },
  seconds: 0,
  prevTime: Date.now(),
  draw: function () {
        // if (!this.mesh) return;
    var now = Date.now()
    this.seconds += (now - this.prevTime) / 1000
    this.prevTime = now

    var ctx = this.getContext()
    ctx.setClearColor(State.bgColor[0], State.bgColor[1], State.bgColor[2], State.bgColor[3])
    ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT)
    ctx.setDepthTest(true)

    var time = Date.now() / 1000

    if (!State.rotate) time = 0

    ctx.setViewMatrix(Mat4.lookAt9(this.view,
                0, 0, 0, 0, 1, 0
            )
        )

    ctx.bindTexture(State.textures[State.currentTexture], 0)
    ctx.bindProgram(this.program)

    ctx.setViewMatrix(this.view)

    ctx.bindMesh(this.mesh)
    ctx.pushModelMatrix()
            // Torus is by default at YZ axis so let's rotate it to YX
    ctx.rotateXYZ([0, Math.PI / 2, 0])
    ctx.rotateXYZ(State.rotation)
    ctx.scale([ State.scale, State.scale, State.scale ])
    ctx.drawMesh()
    ctx.popModelMatrix()

    this.gui.draw()
  }
})
*/
