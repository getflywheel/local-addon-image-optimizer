# Local Image Optimizer Add-on

A [Local](https://localwp.com/) add on for compressing images on your WordPress site. This repository hosts the source code; if you simply want to use the add-on, download the latest version of local from [the release page](https://localwp.com/releases/) and install the add-on within the app.


Currently this add-on performs lossy compression with [`jpeg-recompress`](https://github.com/danielgtaylor/jpeg-archive#jpeg-recompress). It is planned to expand this in the future to leverage more tools that do things like lossless compression.

### Get Started with Local Add-on development

https://build.localwp.com/


## Manual Installation & Development setup

*If you haven't already, it is advised that you familiarize yourself with the basics of [electron](https://www.electronjs.org/).*

### Clone

Clone the repository into one of the following directories depending on your platform:

-   macOS: `~/Library/Application Support/Local/addons`
-   Windows: `C:\Users\username\AppData\Roaming\Local\addons`
-   Linux: `~/.config/Local/addons`

*You need to replace 'Local' with 'Local Beta' in the above paths if you want to create the add-on for Local Beta.*

If you prefer to clone your source code elsewhere, you can do so and then symlink that directory to one in the above mentioned directories.

An example of this on MacOS would look like:

```
git clone git@github.com:getflywheel/local-addon-image-optimizer.git ~/code

ln -s ~/code/local-addon-image-optimizer ~/Library/Application Support/Local/addons
```


### Install Add-on Dependencies

`yarn install` or `npm install`


### Build

This add-on utilizes `tsc` to compile the Main thread code and `webpack` to compile the Renderer thread code.

to compile both at the same time run:

`yarn build`

Otherwise you can compile the main thread code with:

`yarn build-main`

Or the renderer thread code with:

`yarn build-renderer` or `yarn watch-renderer`


### Add Add-on to Local

1. Clone repo directly into the add-ons folder (paths described above)
2. `yarn install` or `npm install` (install dependencies)
2. `yarn build` or `npm run build`
3. Open Local and enable add-on

If the enabling the add-on via the Local UI doesn't work for some reason, you can also enable it by updating the file `enabled-addons.json`. This is located at one of the following application specific paths.

You'll want to make sure that the json file includes:

`"@getflywheel/local-addon-image-optimizer": true`

-	macOS: `~/Library/Application Support/Local/enabled-addons.json`
-   Linux: `~/.config/Local/enabled-addons.json`
-   Windows: `C:\Users\<username>\AppData\Roaming\Local\addons/enabled-addons.json`

### External Libraries

- @getflywheel/local provides type definitions for Local's Add-on API.
	- Node Module: https://www.npmjs.com/package/@getflywheel/local-components
	- GitHub Repo: https://github.com/getflywheel/local-components

It is worth noting the the TS definitions for this module are exposed and publicly availble. The actual code is injected once the add-on is loaded by Local. This can make writing tests a little tricky as the `@getflywheel/local/<main/renderer>` module isn't available outside of Local (ie testing unit testing environments). The best option is to mock out this module while running tests.

- @getflywheel/local-components provides reusable React components to use in your Local add-on.
	- Node Module: https://www.npmjs.com/package/@getflywheel/local
	- GitHub Repo: https://github.com/getflywheel/local-addon-api
	- Style Guide: https://getflywheel.github.io/local-components

### Folder Structure

All files (other than test files) in `/src` will be transpiled to `/lib` using [TypeScript](https://www.typescriptlang.org/). Anything in `/lib` will be overwritten.

`vendor` contains compiled binaries namespaced under the appropriate operating system name.

### Development Workflow

If you are looking for help getting started, you can consult [the documentation for the add-on generator](https://github.com/getflywheel/create-local-addon#next-steps).

You can consult the [Local add-on API](https://getflywheel.github.io/local-addon-api), which provides a wide range of values and functions for developing your add-on.

## License

MIT
