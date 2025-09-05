# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# [3.3.0](https://github.com/pex-gl/pex-gui/compare/v3.2.0...v3.3.0) (2025-09-05)


### Features

* add support for pex-context v4 ([07dad11](https://github.com/pex-gl/pex-gui/commit/07dad11e66ace9f580ff9a14d69b712f4711ae65))



# [3.2.0](https://github.com/pex-gl/pex-gui/compare/v3.1.3...v3.2.0) (2025-07-30)


### Bug Fixes

* add removeEventListener callbacks for overlay items ([0855f18](https://github.com/pex-gl/pex-gui/commit/0855f180b3d6d28b59b56373943c0dacdab101ca))
* default item.prev to 0 for updatable controls ([16bd0da](https://github.com/pex-gl/pex-gui/commit/16bd0da9039a53424795dd09fca8fd9ed6e98420))
* handle tabs without column ([f777066](https://github.com/pex-gl/pex-gui/commit/f777066c2dfd6a8c2e5c47927f2ce074c8377eb8))


### Features

* add overlay option for pass through canvasses ([e97e8e3](https://github.com/pex-gl/pex-gui/commit/e97e8e378086beccdb9dc5e47b6158662fd36116))
* add remove and moveAfter ([5b7055c](https://github.com/pex-gl/pex-gui/commit/5b7055cc6d16b72473dbb0edbcf6185a0e3f2ffb))
* allow columns without title ([13c99a9](https://github.com/pex-gl/pex-gui/commit/13c99a9876d44fd91e45c57d9fa89705416a8880))
* allow update/interval/redraw on labels ([78888e6](https://github.com/pex-gl/pex-gui/commit/78888e6d603f2e3944f7808f0b1ffb70d06c2111))
* extend active area for toggle and checkbox ([a0102db](https://github.com/pex-gl/pex-gui/commit/a0102dbaac4c1e9e2975ec7adf89507cde8cb5c1))
* extract pointer offset in pointer events ([81d6ddd](https://github.com/pex-gl/pex-gui/commit/81d6ddd11de1adb94f6bfd917229bac8dea75dfd))
* update stats and label line height ([dfa5511](https://github.com/pex-gl/pex-gui/commit/dfa55114a1cadec0713342ef9627edd384770fba))



## [3.1.3](https://github.com/pex-gl/pex-gui/compare/v3.1.2...v3.1.3) (2025-04-11)


### Bug Fixes

* add fallback font to theme ([be96f71](https://github.com/pex-gl/pex-gui/commit/be96f715ea9f755631ea69a86604480484b537be)), closes [#44](https://github.com/pex-gl/pex-gui/issues/44)



## [3.1.2](https://github.com/pex-gl/pex-gui/compare/v3.1.1...v3.1.2) (2025-03-24)


### Bug Fixes

* ensure graph values don't overflow render width ([570dcaf](https://github.com/pex-gl/pex-gui/commit/570dcaf35149b356b5a8438864cf876a5b7c9e50))



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
