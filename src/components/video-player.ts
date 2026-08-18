const COMPONENT_SELECTOR = '[data-video-el="component"]';
const PLAYER_SELECTOR = '[data-video-el="player"]';
const TOGGLE_SELECTOR = '[data-video-el="toggle"]';
const PLAY_ICON_SELECTOR = '[data-video-el="play-icon"]';
const PAUSE_ICON_SELECTOR = '[data-video-el="pause-icon"]';
const STATE_ATTRIBUTE = 'data-video-state';
const INVIEW_ATTRIBUTE = 'data-video-inview';
const HOVER_ATTRIBUTE = 'data-video-hover';
const EXCLUSIVE_ATTRIBUTE = 'data-video-exclusive';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';

export type VideoState = 'playing' | 'paused' | 'ended' | 'error';
type PlaybackMode = 'manual' | 'automatic';

type ObserverEntry = Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>;
type ObserverHandle = Pick<IntersectionObserver, 'disconnect' | 'observe'>;

export interface VideoPlayerDependencies {
  createIntersectionObserver?: (
    callback: (entries: ObserverEntry[]) => void,
    options: IntersectionObserverInit
  ) => ObserverHandle;
  matchMedia?: (query: string) => Pick<MediaQueryList, 'matches'>;
}

const playerRegistry = new WeakMap<HTMLElement, VideoPlayer>();
const activePlayers = new Set<VideoPlayer>();
const playbackOwners = new WeakMap<HTMLVideoElement, VideoPlayer>();
let playbackSequence = 0;

export class VideoPlayer {
  private readonly component: HTMLElement;
  private readonly video: HTMLVideoElement;
  private readonly toggle: HTMLElement | null;
  private readonly playIcon: HTMLElement | null;
  private readonly pauseIcon: HTMLElement | null;
  private readonly dependencies: Required<VideoPlayerDependencies>;
  private readonly isExclusive: boolean;
  private observer: ObserverHandle | null = null;
  private hoverPlaybackEnabled = false;
  private inviewPlaybackEnabled = false;
  private isHovered = false;
  private isInView = false;
  private automaticPlayback = false;
  private manualPlayback = false;
  private manualPauseOverride = false;
  private playRequestGeneration = 0;
  private requestSequence = 0;
  private controllerOwnsPlayback = false;

  private readonly handlePlay = () => {
    if (!this.manualPlayback && this.hasAutomaticPlayback()) {
      if (!this.shouldAutomaticallyPlay()) {
        this.automaticPlayback = false;
        this.invalidatePlayRequest();
        this.video.pause();
        return;
      }
      this.automaticPlayback = true;
    }

    if (this.isExclusive) {
      const newerExclusivePlayer = Array.from(activePlayers).find(
        (player) =>
          player !== this &&
          player.isExclusive &&
          player.controllerOwnsPlayback &&
          player.requestSequence > this.requestSequence
      );
      if (newerExclusivePlayer) {
        this.automaticPlayback = false;
        this.manualPlayback = false;
        this.manualPauseOverride = true;
        this.invalidatePlayRequest();
        this.video.pause();
        return;
      }

      activePlayers.forEach((player) => {
        if (
          player !== this &&
          player.isExclusive &&
          (player.controllerOwnsPlayback || !player.video.paused)
        ) {
          player.automaticPlayback = false;
          player.manualPlayback = false;
          player.manualPauseOverride = true;
          player.invalidatePlayRequest();
          player.video.pause();
        }
      });
    }

    this.setState('playing');
  };

  private readonly handlePause = () => this.setState(this.video.ended ? 'ended' : 'paused');

  private readonly handleEnded = () => {
    this.automaticPlayback = false;
    this.manualPlayback = false;
    this.manualPauseOverride = false;
    this.invalidatePlayRequest();
    this.setState('ended');
  };

  private readonly handleError = () => {
    this.automaticPlayback = false;
    this.manualPlayback = false;
    this.invalidatePlayRequest();
    this.setState('error');
  };

  private readonly handleToggle = () => {
    if (!this.video.paused && !this.video.ended) {
      this.automaticPlayback = false;
      this.manualPlayback = false;
      this.manualPauseOverride = true;
      this.invalidatePlayRequest();
      this.video.pause();
      return;
    }

    this.automaticPlayback = false;
    this.manualPlayback = true;
    this.manualPauseOverride = false;
    this.requestPlay('manual');
  };

  private readonly handleHoverStart = () => {
    this.isHovered = true;
    this.manualPauseOverride = false;
    this.reconcileAutomaticPlayback();
  };

  private readonly handleHoverEnd = () => {
    this.isHovered = false;
    this.reconcileAutomaticPlayback();
  };

  constructor(
    component: HTMLElement,
    video: HTMLVideoElement,
    dependencies: VideoPlayerDependencies = {}
  ) {
    this.component = component;
    this.video = video;
    this.toggle = component.querySelector(TOGGLE_SELECTOR);
    this.playIcon = component.querySelector(PLAY_ICON_SELECTOR);
    this.pauseIcon = component.querySelector(PAUSE_ICON_SELECTOR);
    this.isExclusive = component.getAttribute(EXCLUSIVE_ATTRIBUTE) === 'true';
    this.dependencies = {
      createIntersectionObserver:
        dependencies.createIntersectionObserver ??
        ((callback, options) => new IntersectionObserver(callback, options)),
      matchMedia: dependencies.matchMedia ?? ((query) => window.matchMedia(query)),
    };

    this.video.addEventListener('play', this.handlePlay);
    this.video.addEventListener('pause', this.handlePause);
    this.video.addEventListener('ended', this.handleEnded);
    this.video.addEventListener('error', this.handleError);
    this.toggle?.addEventListener('click', this.handleToggle);
    activePlayers.add(this);

    this.setupAutomaticPlayback();
    this.syncState();
  }

  private setupAutomaticPlayback(): void {
    const requestsHoverPlayback = this.component.getAttribute(HOVER_ATTRIBUTE) === 'true';
    const requestsInviewPlayback = this.component.getAttribute(INVIEW_ATTRIBUTE) === 'true';
    const hasNativeAutoplay = this.video.autoplay;
    if (!requestsHoverPlayback && !requestsInviewPlayback && !hasNativeAutoplay) return;

    const reducedMotion = this.dependencies.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reducedMotion) {
      this.disableNativeAutoplay();
      return;
    }

    if (requestsHoverPlayback) {
      const canHover = this.dependencies.matchMedia(FINE_HOVER_QUERY).matches;
      if (canHover && this.video.muted) {
        this.hoverPlaybackEnabled = true;
        this.disableNativeAutoplay();
        this.component.addEventListener('mouseenter', this.handleHoverStart);
        this.component.addEventListener('mouseleave', this.handleHoverEnd);
      }
    }

    if (!requestsInviewPlayback) return;

    if (!this.video.muted || !this.video.playsInline) {
      console.warn(
        '[VideoPlayer] In-view playback requires the native video to be muted and playsinline:',
        this.component
      );
      return;
    }

    this.inviewPlaybackEnabled = true;

    // IntersectionObserver owns autoplay timing for in-view players. Disabling the
    // native attribute closes the race where media begins loading after an initial
    // offscreen observer callback.
    this.disableNativeAutoplay();

    this.observer = this.dependencies.createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== this.component) return;
          const enteredView = entry.isIntersecting && !this.isInView;
          this.isInView = entry.isIntersecting;
          if (enteredView) this.manualPauseOverride = false;
          this.reconcileAutomaticPlayback();
        });
      },
      { rootMargin: '50px', threshold: 0.1 }
    );
    this.observer.observe(this.component);
  }

  private disableNativeAutoplay(): void {
    if (!this.video.autoplay) return;
    this.video.autoplay = false;
    if (!this.video.paused) this.video.pause();
  }

  private hasAutomaticPlayback(): boolean {
    return this.hoverPlaybackEnabled || this.inviewPlaybackEnabled;
  }

  private shouldAutomaticallyPlay(): boolean {
    return (
      (this.hoverPlaybackEnabled && this.isHovered) || (this.inviewPlaybackEnabled && this.isInView)
    );
  }

  private reconcileAutomaticPlayback(): void {
    if (this.manualPlayback) return;

    if (!this.shouldAutomaticallyPlay()) {
      this.manualPauseOverride = false;
      if (this.automaticPlayback) {
        this.automaticPlayback = false;
        this.invalidatePlayRequest();
        this.video.pause();
      }
      return;
    }

    if (this.manualPauseOverride || !this.video.paused || this.automaticPlayback) return;

    this.automaticPlayback = true;
    this.requestPlay('automatic');
  }

  private requestPlay(mode: PlaybackMode): void {
    const requestGeneration = ++this.playRequestGeneration;
    this.requestSequence = ++playbackSequence;
    this.controllerOwnsPlayback = true;
    playbackOwners.set(this.video, this);

    void this.video
      .play()
      .then(() => {
        if (requestGeneration !== this.playRequestGeneration && !playbackOwners.has(this.video)) {
          this.video.pause();
        }
      })
      .catch((error) => {
        if (
          requestGeneration !== this.playRequestGeneration ||
          playbackOwners.get(this.video) !== this
        ) {
          return;
        }
        const requestWasCancelled = mode === 'automatic' && !this.automaticPlayback;
        if (mode === 'automatic') this.automaticPlayback = false;
        if (mode === 'manual') this.manualPlayback = false;
        this.controllerOwnsPlayback = false;
        playbackOwners.delete(this.video);
        if (!requestWasCancelled) console.error('[VideoPlayer] Playback failed:', error);
        this.syncState();
      });
  }

  private invalidatePlayRequest(): void {
    this.playRequestGeneration += 1;
    this.controllerOwnsPlayback = false;
    if (playbackOwners.get(this.video) === this) playbackOwners.delete(this.video);
  }

  private syncState(): void {
    if (this.video.ended) {
      this.setState('ended');
    } else if (this.video.paused) {
      this.setState('paused');
    } else {
      this.setState('playing');
    }
  }

  private setState(state: VideoState): void {
    this.component.setAttribute(STATE_ATTRIBUTE, state);

    const isPlaying = state === 'playing';
    this.toggle?.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');

    if (this.playIcon) this.playIcon.hidden = isPlaying;
    if (this.pauseIcon) this.pauseIcon.hidden = !isPlaying;
  }

  destroy(): void {
    this.observer?.disconnect();
    const ownsPlayback = this.controllerOwnsPlayback;
    this.automaticPlayback = false;
    this.manualPlayback = false;
    this.invalidatePlayRequest();
    if (ownsPlayback) this.video.pause();
    this.video.removeEventListener('play', this.handlePlay);
    this.video.removeEventListener('pause', this.handlePause);
    this.video.removeEventListener('ended', this.handleEnded);
    this.video.removeEventListener('error', this.handleError);
    this.toggle?.removeEventListener('click', this.handleToggle);
    this.component.removeEventListener('mouseenter', this.handleHoverStart);
    this.component.removeEventListener('mouseleave', this.handleHoverEnd);
    activePlayers.delete(this);
    playerRegistry.delete(this.component);
  }
}

export function initVideoPlayers(
  root: ParentNode = document,
  dependencies: VideoPlayerDependencies = {}
): VideoPlayer[] {
  return Array.from(root.querySelectorAll<HTMLElement>(COMPONENT_SELECTOR)).flatMap((component) => {
    const existingPlayer = playerRegistry.get(component);
    if (existingPlayer) return [existingPlayer];

    const video = component.querySelector(PLAYER_SELECTOR);
    if (!(video instanceof HTMLVideoElement)) {
      console.warn('[VideoPlayer] Native video element not found:', component);
      return [];
    }

    const player = new VideoPlayer(component, video, dependencies);
    playerRegistry.set(component, player);
    return [player];
  });
}

if (typeof document !== 'undefined') {
  initVideoPlayers();
}
