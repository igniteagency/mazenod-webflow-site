import { initMotionReadiness } from '$utils/motion-readiness';

const ORIGINAL_GLOBAL =
  'https://cdn.jsdelivr.net/gh/igniteagency/mazenod-webflow-site@7289a740921031b482ca3acd62a31a2ad4269f95/dist/prod/global.js';
const staging = location.hostname === 'mazenod-college.webflow.io';
const script = document.currentScript as HTMLScriptElement | null;
const stagedGlobal = script?.src ? new URL('../global.js', script.src).href : ORIGINAL_GLOBAL;

if (staging) initMotionReadiness();
window.loadScript(staging ? stagedGlobal : ORIGINAL_GLOBAL, { name: 'global', placement: 'head' });
