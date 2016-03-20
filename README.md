# enyo-nwjs-templates
A collection of nwjs-based app templates for enyo-dev

--------------------

##Installation
Start by cloning this repository (or downloading and extracting the repository zip) to a desired location. From there, you can add the templates to enyo-dev via:

```
enyo templates add nwjs
enyo templates add nwjs-onyx
enyo templates add nwjs-moonstone
```
As the names would imply, `nwjs` is the basic Enyo core with nwjs support, `nwjs-onyx` is the same with with a basic onyx UI, and `nwjs-moonstone` is mostly the same with a basic moonstone UI. The main difference with `nwjs-moonstone` is that the window frame is hidden, the `moonstone/Panels` close button actually closes the window, and you can move the window around by dragging on the top of the window.

##Usage

To create a new project with a given template, create a new directory and then within it, initialize with with enyo-dev. For example:

```
enyo init --template=nwjs
```

##Gulpfile
Included in each template is a gulpfile for your projects. Be sure to run `npm install` on your project and have gulp-cli installed on your system (`npm install -g gulp-cli`). The following gulp tasks are available:

* `init` - Fetches the enyo libraries via enyo-dev
* `enyo` - Builds the app with enyo-dev
* `nwjs` - Packages built app with nwjs for the current platform
* `nwjs-all` - Packages built app with nwjs for all available platforms
* `run` - Runs the built app directly with nwjs without packaging
* `build` - Combination of the 'enyo' task then the 'nwjs' task
* `build-all` - Combination of the 'enyo' task then the 'nwjs-all' task

For `enyo` (and by extension `build` and `build-all`), all extra arguments/options will be forwarded to the `enyo pack` command.

For `nwjs`, `nwjs-all` and `run` (and by extension `build` and `build-all`), using -P/--production will disable the navigation/developer toolbar. Additionally, using -l/--log-level with a level of info/debug/trace will produce additional logging of the nwjs build process.

The default task is `build`