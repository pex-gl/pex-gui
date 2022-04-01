# pex-gui

[![npm version](https://img.shields.io/npm/v/pex-gui)](https://www.npmjs.com/package/pex-gui)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/pex-gui)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/pex-gui)](https://bundlephobia.com/package/pex-gui)
[![dependencies](https://img.shields.io/librariesio/release/npm/pex-gui)](https://github.com/pex-gl/pex-gui/blob/main/package.json)
[![types](https://img.shields.io/npm/types/pex-gui)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/pex-gl/pex-gui)](https://github.com/pex-gl/pex-gui/blob/main/LICENSE.md)

GUI controls for [PEX](https://pex.gl).

![](https://raw.githubusercontent.com/pex-gl/pex-gui/main/screenshot.png)

## Installation

```bash
npm install pex-gui
```

## Usage

```js
import pexGui from "pex-gui";
console.log(pexGui);
```

## API

<!-- api-start -->

## Classes

<dl>
<dt><a href="#GUI">GUI</a></dt>
<dd><p>GUI controls for PEX.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#GUIControlOptions">GUIControlOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#GUIOptions">GUIOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="GUI"></a>

## GUI

GUI controls for PEX.

**Kind**: global class
**Properties**

| Name      | Type                 | Default           | Description                                     |
| --------- | -------------------- | ----------------- | ----------------------------------------------- |
| [enabled] | <code>boolean</code> | <code>true</code> | Enable/disable pointer interaction and drawing. |

- [GUI](#GUI)
  - [new GUI(ctx, opts)](#new_GUI_new)
  - [.addTab(title, contextObject, attributeName, [options], onChange)](#GUI+addTab) ⇒ <code>GUIControl</code>
  - [.addColumn(title, [width])](#GUI+addColumn) ⇒ <code>GUIControl</code>
  - [.addHeader(title)](#GUI+addHeader) ⇒ <code>GUIControl</code>
  - [.addSeparator()](#GUI+addSeparator) ⇒ <code>GUIControl</code>
  - [.addLabel(title)](#GUI+addLabel) ⇒ <code>GUIControl</code>
  - [.addParam(title, contextObject, attributeName, [options], onChange)](#GUI+addParam) ⇒ <code>GUIControl</code>
  - [.addButton(title, onClick)](#GUI+addButton) ⇒ <code>GUIControl</code>
  - [.addRadioList(title, contextObject, attributeName, items, onChange)](#GUI+addRadioList) ⇒ <code>GUIControl</code>
  - [.addTexture2DList(title, contextObject, attributeName, items, [itemsPerRow], onChange)](#GUI+addTexture2DList) ⇒ <code>GUIControl</code>
  - [.addTexture2D(title, texture, options)](#GUI+addTexture2D) ⇒ <code>GUIControl</code>
  - [.addTextureCube(title, texture, options)](#GUI+addTextureCube) ⇒ <code>GUIControl</code>
  - [.addGraph(title, options)](#GUI+addGraph) ⇒ <code>GUIControl</code>
  - [.addFPSMeeter()](#GUI+addFPSMeeter) ⇒ <code>GUIControl</code>
  - [.addStats([options])](#GUI+addStats) ⇒ <code>GUIControl</code>
  - [.draw()](#GUI+draw)
  - [.serialize()](#GUI+serialize) ⇒ <code>Object</code>
  - [.deserialize(data)](#GUI+deserialize)
  - [.dispose()](#GUI+dispose)

<a name="new_GUI_new"></a>

### new GUI(ctx, opts)

Creates an instance of GUI.

| Param | Type                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| ctx   | <code>module:pex-context~ctx</code> \| <code>CanvasRenderingContext2D</code> |
| opts  | [<code>GUIOptions</code>](#GUIOptions)                                       |

<a name="GUI+addTab"></a>

### guI.addTab(title, contextObject, attributeName, [options], onChange) ⇒ <code>GUIControl</code>

Add a tab control.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param         | Type                                                 | Default         |
| ------------- | ---------------------------------------------------- | --------------- |
| title         | <code>string</code>                                  |                 |
| contextObject | <code>Object</code>                                  |                 |
| attributeName | <code>string</code>                                  |                 |
| [options]     | [<code>GUIControlOptions</code>](#GUIControlOptions) | <code>{}</code> |
| onChange      | <code>function</code>                                |                 |

<a name="GUI+addColumn"></a>

### guI.addColumn(title, [width]) ⇒ <code>GUIControl</code>

Add a column control with a header.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param   | Type                | Default                             |
| ------- | ------------------- | ----------------------------------- |
| title   | <code>string</code> |                                     |
| [width] | <code>number</code> | <code>this.theme.columnWidth</code> |

<a name="GUI+addHeader"></a>

### guI.addHeader(title) ⇒ <code>GUIControl</code>

Add a header control.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param | Type                |
| ----- | ------------------- |
| title | <code>string</code> |

<a name="GUI+addSeparator"></a>

### guI.addSeparator() ⇒ <code>GUIControl</code>

Add some breathing space between controls.

**Kind**: instance method of [<code>GUI</code>](#GUI)
<a name="GUI+addLabel"></a>

### guI.addLabel(title) ⇒ <code>GUIControl</code>

Add a text label. Can be multiple line.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param | Type                |
| ----- | ------------------- |
| title | <code>string</code> |

**Example**

```js
gui.addLabel("Multiline\nLabel");
```

<a name="GUI+addParam"></a>

### guI.addParam(title, contextObject, attributeName, [options], onChange) ⇒ <code>GUIControl</code>

Add a generic parameter control.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param         | Type                                                 | Default         |
| ------------- | ---------------------------------------------------- | --------------- |
| title         | <code>string</code>                                  |                 |
| contextObject | <code>Object</code>                                  |                 |
| attributeName | <code>string</code>                                  |                 |
| [options]     | [<code>GUIControlOptions</code>](#GUIControlOptions) | <code>{}</code> |
| onChange      | <code>function</code>                                |                 |

**Example**

```js
gui.addParam("Checkbox", State, "rotate");

gui.addParam("Text message", State, "text", {}, function (value) {
  console.log(value);
});

gui.addParam("Slider", State, "range", {
  min: -Math.PI / 2,
  max: Math.PI / 2,
});

gui.addParam("Multi Slider", State, "position", {
  min: 0,
  max: 10,
});

gui.addParam("Color [RGBA]", State, "color");

gui.addParam("Texture", State, "texture");
gui.addParam("Texture Cube", State, "textureCube");
```

<a name="GUI+addButton"></a>

### guI.addButton(title, onClick) ⇒ <code>GUIControl</code>

Add a clickable button.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param   | Type                  |
| ------- | --------------------- |
| title   | <code>string</code>   |
| onClick | <code>function</code> |

**Example**

```js
gui.addButton("Button", () => {
  console.log("Called back");
});
```

<a name="GUI+addRadioList"></a>

### guI.addRadioList(title, contextObject, attributeName, items, onChange) ⇒ <code>GUIControl</code>

Add a radio list with options.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param         | Type                                                     |
| ------------- | -------------------------------------------------------- |
| title         | <code>string</code>                                      |
| contextObject | <code>Object</code>                                      |
| attributeName | <code>string</code>                                      |
| items         | <code>Array.&lt;{name: string, value: number}&gt;</code> |
| onChange      | <code>function</code>                                    |

**Example**

```js
gui.addRadioList(
  "Radio list",
  State,
  "currentRadioListChoice",
  ["Choice 1", "Choice 2", "Choice 3"].map((name, value) => ({
    name,
    value,
  }))
);
```

<a name="GUI+addTexture2DList"></a>

### guI.addTexture2DList(title, contextObject, attributeName, items, [itemsPerRow], onChange) ⇒ <code>GUIControl</code>

Add a texture visualiser and selector for multiple textures (from pex-context) or images.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param         | Type                                                                                                 | Default        |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------------- |
| title         | <code>string</code>                                                                                  |                |
| contextObject | <code>Object</code>                                                                                  |                |
| attributeName | <code>string</code>                                                                                  |                |
| items         | <code>Array.&lt;{texture: (module:pex-context~texture\|CanvasImageSource), value: number}&gt;</code> |                |
| [itemsPerRow] | <code>number</code>                                                                                  | <code>4</code> |
| onChange      | <code>function</code>                                                                                |                |

**Example**

```js
gui.addTexture2DList("List", State, "currentTexture", textures.map((texture, value) = > ({ texture, value })));
```

<a name="GUI+addTexture2D"></a>

### guI.addTexture2D(title, texture, options) ⇒ <code>GUIControl</code>

Add a texture (from pex-context) or image visualiser.
Notes: texture cannot be updated once created.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param   | Type                                                                      |
| ------- | ------------------------------------------------------------------------- |
| title   | <code>string</code>                                                       |
| texture | <code>module:pex-context~texture</code> \| <code>CanvasImageSource</code> |
| options | [<code>GUIControlOptions</code>](#GUIControlOptions)                      |

**Example**

```js
gui.addTexture2D("Single", image);
```

<a name="GUI+addTextureCube"></a>

### guI.addTextureCube(title, texture, options) ⇒ <code>GUIControl</code>

Add a cube texture visualiser (from pex-context).
Notes: texture cannot be updated once created.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param   | Type                                        | Description                                                                                     |
| ------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| title   | <code>string</code>                         |                                                                                                 |
| texture | <code>module:pex-context~textureCube</code> |                                                                                                 |
| options | <code>Object</code>                         | "flipEnvMap" should be 1 for dynamic cubemaps and -1 for cubemaps from file with X axis flipped |

**Example**

```js
gui.addParam("Cube", State, "cubeTextureParam", { level: 2 });
```

<a name="GUI+addGraph"></a>

### guI.addGraph(title, options) ⇒ <code>GUIControl</code>

Add a XY graph visualiser from the control values.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param   | Type                                                 |
| ------- | ---------------------------------------------------- |
| title   | <code>string</code>                                  |
| options | [<code>GUIControlOptions</code>](#GUIControlOptions) |

**Example**

```js
gui.addGraph("Sin", {
  interval: 500,
  t: 0,
  update(item) {
    item.options.t += 0.01;
  },
  redraw(item) {
    item.values.push(+Math.sin(item.options.t).toFixed(3));
  },
});
```

<a name="GUI+addFPSMeeter"></a>

### guI.addFPSMeeter() ⇒ <code>GUIControl</code>

Add a FPS counter. Need "gui.draw()" to be called on frame.

**Kind**: instance method of [<code>GUI</code>](#GUI)
<a name="GUI+addStats"></a>

### guI.addStats([options]) ⇒ <code>GUIControl</code>

Add an updatable object stats visualiser.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param     | Type                | Description                                                  |
| --------- | ------------------- | ------------------------------------------------------------ |
| [options] | <code>Object</code> | An object with an update() function to update control.stats. |

<a name="GUI+draw"></a>

### guI.draw()

Renders the GUI. Should be called at the end of the frame.

**Kind**: instance method of [<code>GUI</code>](#GUI)
<a name="GUI+serialize"></a>

### guI.serialize() ⇒ <code>Object</code>

Retrieve a serialized value of the current GUI's state.

**Kind**: instance method of [<code>GUI</code>](#GUI)
<a name="GUI+deserialize"></a>

### guI.deserialize(data)

Deserialize a previously serialized data state GUI's state.

**Kind**: instance method of [<code>GUI</code>](#GUI)

| Param | Type                |
| ----- | ------------------- |
| data  | <code>Object</code> |

<a name="GUI+dispose"></a>

### guI.dispose()

Remove events listeners, empty list of controls and dispose of the gui's resources.

**Kind**: instance method of [<code>GUI</code>](#GUI)
<a name="GUIControlOptions"></a>

## GUIControlOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name      | Type                          | Default        | Description                                  |
| --------- | ----------------------------- | -------------- | -------------------------------------------- |
| [min]     | <code>number</code>           | <code>0</code> |                                              |
| [max]     | <code>number</code>           | <code>0</code> |                                              |
| [alpha]   | <code>boolean</code>          |                | Set to add a 4th slider for colors.          |
| [palette] | <code>HTMLImageElement</code> |                | Set to draw a palette image as color picker. |

<a name="GUIOptions"></a>

## GUIOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name         | Type                 | Default                              | Description                                                                             |
| ------------ | -------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| [pixelRatio] | <code>boolean</code> | <code>window.devicePixelRatio</code> |                                                                                         |
| [theme]      | <code>boolean</code> |                                      | See [theme file](https://github.com/pex-gl/pex-gui/blob/main/theme.js) for all options. |
| [scale]      | <code>number</code>  | <code>1</code>                       |                                                                                         |
| [responsive] | <code>boolean</code> | <code>true</code>                    | Adapts to canvas dimension.                                                             |

<!-- api-end -->

## License

MIT. See [license file](https://github.com/pex-gl/pex-gui/blob/main/LICENSE.md).
