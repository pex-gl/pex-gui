# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.1.1](https://github.com/pex-gl/pex-gui/compare/v3.1.0...v3.1.1) (2024-11-26)


### Bug Fixes

* allow update interval of 0 for stats and graph controls ([154220f](https://github.com/pex-gl/pex-gui/commit/154220ffec80027e4ed88d16f416ce098fed5b9a))



# [3.1.0](https://github.com/pex-gl/pex-gui/compare/v3.0.1...v3.1.0) (2024-11-22)


### Bug Fixes

* check for nullish when rendering graph control value ([6e5c7bb](https://github.com/pex-gl/pex-gui/commit/6e5c7bb0c946312075de03e35120224163707412))
* use round instead of floor in fps graph redraw ([1373b6b](https://github.com/pex-gl/pex-gui/commit/1373b6b894539396262e67e978d32c8ad9f1ba05))


### Features

* add format support to graph controls ([506553a](https://github.com/pex-gl/pex-gui/commit/506553aaa04bf526adf4e6c13a3ceba96de59ec8))
* handle multiline and empty string title in control stats ([285e223](https://github.com/pex-gl/pex-gui/commit/285e223447a4f3e6fde422f990939576809de54a))



## [3.0.1](https://github.com/pex-gl/pex-gui/compare/v3.0.0...v3.0.1) (2024-07-09)



# [3.0.0](https://github.com/pex-gl/pex-gui/compare/v3.0.0-alpha.3...v3.0.0) (2024-02-05)



# [3.0.0-alpha.3](https://github.com/pex-gl/pex-gui/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-02-27)


### Features

* add title for gui.addStats ([68e7f5f](https://github.com/pex-gl/pex-gui/commit/68e7f5f251da1c1afb265873e0e5255b983985ff))



# [3.0.0-alpha.2](https://github.com/pex-gl/pex-gui/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2022-09-09)


### Bug Fixes

* don't assume pixel ratio from pex-context ([b8a6d9f](https://github.com/pex-gl/pex-gui/commit/b8a6d9f3b502643a1a189e509113510886928c3d))


### Features

* make gui render at the size regardless of the canvas size or pixel ratio unless it overflows the canvas viewport ([17eab56](https://github.com/pex-gl/pex-gui/commit/17eab565705b031fc96826dee434a60b46534e08))



# [3.0.0-alpha.1](https://github.com/pex-gl/pex-gui/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2022-07-26)



# [3.0.0-alpha.0](https://github.com/pex-gl/pex-gui/compare/v2.4.0...v3.0.0-alpha.0) (2022-07-26)


### Bug Fixes

* add missing GUIControl.setPosition ([b9bf584](https://github.com/pex-gl/pex-gui/commit/b9bf5840fecd0144a6b8639ffcbd0a940bbcd4f6))
* allow hardcoded GUIControl position x/y ([278c787](https://github.com/pex-gl/pex-gui/commit/278c7870a9f5b5c5c0f08e824102dfe135860333))
* handle nullish options in addParam ([fbb6599](https://github.com/pex-gl/pex-gui/commit/fbb6599eadbe2647b5f1e6cc4c7f9f86c794e9c9))


### Code Refactoring

* use ES modules ([ca261fa](https://github.com/pex-gl/pex-gui/commit/ca261faa2568dad81ca8c0467da26339df0063e8))


### Features

* add flipY option for 2D textures ([368dabb](https://github.com/pex-gl/pex-gui/commit/368dabbe60645bcc3ec55f0789bf8b82a55b2c7f)), closes [#38](https://github.com/pex-gl/pex-gui/issues/38)
* allow gui.pixelRatio to be updated ([e9169db](https://github.com/pex-gl/pex-gui/commit/e9169db7f0c46fda741eeedbfd2b00eee2a64e28))
* allow scale and responsive as options ([e27ca9c](https://github.com/pex-gl/pex-gui/commit/e27ca9ccc53cdd4dc86241cdfa5ca4a7088fef15))
* move to pointer events ([e64c6d1](https://github.com/pex-gl/pex-gui/commit/e64c6d12d1742be7a88885559b96c6c41438b55f))
* update pex-color to latest api ([9faa62a](https://github.com/pex-gl/pex-gui/commit/9faa62af0e5e48b7c54c1d3db7a52b451dd972ee))


### BREAKING CHANGES

* switch to type module
