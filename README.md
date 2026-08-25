# Mazenod Webflow Site

This GitHub project provides a development workflow for JavaScript files in Mazenod Webflow Site.

In essence, it uses bun to start a development server on [localhost:3000](http://localhost:3000), bundle, build and serve any working file (from the `/src` directory) in local mode. Once pushed up and merged into `main`, it's auto-tagged with the latest semver tag version (using Github CI), and the production code will be auto-loaded from [jsDelivr CDN](https://www.jsdelivr.com/).

**Keep the repository public for jsDelivr to access and serve the file via CDN**

## Install

### Prerequisites

- Have [bun](https://bun.sh/) installed locally. Installation guidelines [here](https://bun.sh/docs/installation) (recommended approach - homebrew / curl)
  - Alternatively, `pnpm` or `npm` will work too.

### Setup

- Run `bun install`
  - Alternatively, `pnpm install` or `npm install`

## Usage

After repository migration, update the repo name and URL in this README file, and the `./src/entry.ts`.

### Output

The project will process and output the files mentioned in the `files` const of `./bin/build.js` file. The output minified files will be in the `./dist/prod` folder for production (pushed to github), and in the `./dist/dev` used for local file serving (excluded from Git).

### Development

1. The initial `entry.js` file needs to be made available via external server first for this system to work (in the `<head>` area of the site).

   ```html
   <script src="https://cdn.jsdelivr.net/gh/igniteagency/mazenod-webflow-site/dist/prod/entry.js"></script>
   ```

   For occasional localhost testing when editing `entry.js`, you'll have to manually include that script like following:

   ```html
   <script src="http://localhost:3000/entry.js"></script>
   ```

2. **Load scripts dynamically using `window.loadScript`**

   You can load any script relative to your repo, or a full CDN URL, using the global `window.loadScript` function. This is the recommended way to load scripts in this setup.

   **Usage:**

   ```js
   // Load a relative script (from CDN or localhost, depending on env)
   window.loadScript('global.js');

   // Load an external library from a CDN, with options
   window.loadScript('https://cdn.jsdelivr.net/npm/some-lib@1.0.0/dist/index.js', {
     placement: 'head', // 'head' or 'body' (default: 'body')
     scriptName: 'some-lib', // Optional: emits a custom event 'scriptLoaded:some-lib' when loaded
     defer: true, // (default: true)
     isModule: false, // (default: false)
   });
   ```
   - Scripts are loaded as classic scripts by default, matching the IIFE build output.
   - The function deduplicates by URL (won't load the same script twice).
   - You can listen for a custom event when a script is loaded:

     ```js
     document.addEventListener('scriptLoaded:some-lib', (e) => {
       // e.detail.url, e.detail.name, e.detail.scriptName
       // Your code here
     });
     ```

   - **Options:**
     - `placement`: `'head' | 'body'` (default: `'body'`)
     - `defer`: `boolean` (default: `true`)
     - `isModule`: `boolean` (default: `false`)
     - `scriptName`: `string` (optional, for custom event)

   **Do not use the old `window.JS_SCRIPTS` set or batch loading. Use `window.loadScript` for all dynamic script loading.**

### Native video player

`global.js` conditionally loads `components/video-player.js` when a page contains a native video component. The native `<video>` attributes remain the source of truth for sources, poster, preload, muted, loop, and playsinline. Enabled hover/in-view modes take ownership of autoplay timing so a video cannot start outside its configured automatic-playback conditions.

```html
<div
  data-video-el="component"
  data-video-inview="true"
  data-video-hover="true"
  data-video-exclusive="true"
>
  <video
    data-video-el="player"
    muted
    playsinline
    loop
    preload="metadata"
    poster="/images/video-poster.webp"
  >
    <source src="/video/example.webm" type="video/webm" />
    <source src="/video/example.mp4" type="video/mp4" />
  </video>

  <button type="button" data-video-el="toggle" aria-label="Play video">
    <span data-video-el="play-icon" aria-hidden="true">Play</span>
    <span data-video-el="pause-icon" aria-hidden="true" hidden>Pause</span>
  </button>
</div>
```

- `data-video-inview="true"` opts a muted, playsinline video into play-in-view and pause-out-of-view behaviour.
- `data-video-hover="true"` opts a muted video into hover playback on fine-pointer devices.
- `data-video-exclusive="true"` pauses other managed exclusive videos when this one starts.
- Use a native `<button type="button">` for `data-video-el="toggle"` so keyboard behaviour is provided by the browser.
- When hover and in-view playback are both enabled, the video remains active while either condition is true.
- Automatic playback—including an authored native `autoplay` attribute on a managed component—is disabled for people who prefer reduced motion; manual controls continue to work.
- Playback state is exposed as `data-video-state="paused|playing|ended|error"` on the component.
- The optional toggle label and play/pause icons follow actual native media events.
- The script never unmutes or seeks the video automatically.

If site CSS overrides the browser's native `[hidden]` behaviour, add this narrowly scoped fallback:

```css
[data-video-el='play-icon'][hidden],
[data-video-el='pause-icon'][hidden] {
  display: none !important;
}
```

### History timeline read more

Add this attribute to the existing **button element** directly below each history paragraph:

```text
data-history-timeline = read-more
```

The timeline script then:

- limits the immediately preceding paragraph to four lines by default;
- hides the complete Webflow button wrapper when the paragraph fits within four lines;
- smoothly expands and collapses longer paragraphs, with reduced-motion support;
- changes the `.button_text` label between `Read more` and `Read less`;
- adds `aria-expanded`, `aria-controls`, and an accessible label automatically;
- keeps both timeline arrows inside the navigation row and starts the generated year rail on its middle copy so it can loop in either direction.

If the paragraph is not immediately before the button's `.button_component` wrapper, mark the intended paragraph explicitly with:

```text
data-history-timeline = read-more-text
```

To override the expanded label, add this optional attribute to the button:

```text
data-history-read-more-expanded-label = Show less
```

3. Whilst working locally, run `bun run dev` to start a development server on [localhost:3000](http://localhost:3000)
   - Alternatively, `pnpm run dev` or `npm run dev`

4. To switch between serving scripts from localhost or CDN, use the following in your browser console:

   - To serve scripts from localhost (when running the dev server):
     ```js
     window.setScriptMode('local');
     ```
   - To switch back to CDN serving mode:
     ```js
     window.setScriptMode('cdn');
     ```

   This preference is saved in the browser's localStorage. If the local server is not running, it will automatically fall back to CDN.

5. As you make changes to your code locally and save, the [localhost:3000](http://localhost:3000) server will serve those files.

#### Debugging

- Add any debug console logs in the code using the `console.debug` function instead of `console.log`. This way, they can be toggled on/off using the browser native "Verbose/Debug" level.
- There is an optional debug mode setup for development that can execute conditional logic using `window.IS_DEBUG` check. Execute `window.setDebugMode(true)` in the browser console to enable the debug mode. Execute `window.setDebugMode(false)` to disable the mode.

### Publishing the code to CDN

1. Run `bun run build` to generate the production files in `./dist/prod` folder
   - Alternatively, `pnpm run build` or `npm run build`

2. To push code to production, merge the working branch into `main`. A Github Actions workflow will run tagging that version with an incremented [semver](https://semver.org/) tag. Once pushed, the production code will be auto loaded from [jsDelivr CDN](https://www.jsdelivr.com/).
   - By default, the version bump is a patch (`x.y.{{patch number}}`). To bump the version by a higher amount, mention a hashtag in the merge commit message, like `#major` or `#minor`

3. To create separate environments for `dev` and `staging`, respective branches can be used, and the [jsDelivr file path can be set to load the latest scripts from those respective branches](https://www.jsdelivr.com/documentation#id-github). Note: The [caching for branches lasts 12 hours](https://www.jsdelivr.com/documentation#id-caching) and would hence require a manual purge.
   - To do so, override the `window.PRODUCTION_BASE` variable in the HTML file after the inclusion of `entry.js` script.

#### jsDelivr Notes & Caveats

- Direct jsDelivr links directly use semver tagged releases when available, else falls back to the master branch [[info discussion link](https://github.com/jsdelivr/jsdelivr/issues/18376#issuecomment-1046876129)]
- Tagged version branches are purged every 12 hours from their servers [[info discussion link](https://github.com/jsdelivr/jsdelivr/issues/18376#issuecomment-1046918481)]
- To manually purge a tagged version's files, wait for 10 minutes after the new release tag is added [[info discussion link](https://github.com/jsdelivr/jsdelivr/issues/18376#issuecomment-1047040896)]

[**JSDelivr CDN Purge URL**](https://www.jsdelivr.com/tools/purge)
