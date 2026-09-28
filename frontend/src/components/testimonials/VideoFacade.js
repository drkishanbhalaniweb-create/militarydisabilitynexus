import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from 'lucide-react';
import {
  formatDurationDisplay,
  getVideoAspectRatioConfig,
} from '../../lib/testimonials';

/**
 * Custom Lightweight HTML5 Video Player with Branded Controls
 * - Optimized for squarish 4:5 aspect ratio (smartphone / vertical reel recordings)
 * - 0 KB third-party JavaScript (pure React + HTML5 <video> + Tailwind CSS)
 * - Branded military red/crimson accents (#B91C3C)
 * - Exposes currentTime getter/setter and seekTo for Google Key Moments & transcript seeking
 */
const VideoFacade = forwardRef(function VideoFacade(
  {
    videoUrl,
    aspectRatio = '4:5',
    thumbnailUrl = null,
    duration = null,
    title = 'Veteran Video Testimonial',
    priority = false,
    _autoPlayOnClick = true,
    initialStart = 0,
    onPlay = null,
    onTimeUpdate = null,
    className = '',
  },
  ref
) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const pendingSeekRef = useRef(initialStart > 0 ? initialStart : null);

  const ratioConfig = getVideoAspectRatioConfig(aspectRatio);

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(Number(duration) || 0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const broadcastPlay = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('video-facade-play', { detail: { url: videoUrl } }));
    }
  }, [videoUrl]);

  // Reset internal state if videoUrl prop changes
  useEffect(() => {
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    setBufferedProgress(0);
    setHasError(false);
    setPosterError(false);
  }, [videoUrl]);

  // Global mouseup / touchend listener to guarantee isScrubbing resets even if pointer leaves element
  useEffect(() => {
    if (!isScrubbing) return;
    const handleGlobalRelease = () => {
      setIsScrubbing(false);
      if (videoRef.current && isPlaying) {
        broadcastPlay();
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, [isScrubbing, isPlaying, broadcastPlay]);

  // Pause this player if another VideoFacade starts playing on the page
  useEffect(() => {
    const handleOtherPlay = (e) => {
      if (e.detail?.url !== videoUrl && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('video-facade-play', handleOtherPlay);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('video-facade-play', handleOtherPlay);
      }
    };
  }, [videoUrl]);

  // Expose imperative handle so parent (Key Moments, transcript, etc.) can seek or control video
  useImperativeHandle(
    ref,
    () => {
      return {
        get currentTime() {
          return videoRef.current ? videoRef.current.currentTime : 0;
        },
        set currentTime(seconds) {
          const targetSec = Math.max(0, Number(seconds) || 0);
          setHasStarted(true);
          setCurrentTime(targetSec);
          if (videoRef.current) {
            if (videoRef.current.readyState >= 1) {
              videoRef.current.currentTime = targetSec;
            } else {
              pendingSeekRef.current = targetSec;
            }
            if (videoRef.current.paused) {
              broadcastPlay();
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
              if (onPlay) onPlay();
            }
          }
        },
        seekTo(seconds) {
          const targetSec = Math.max(0, Number(seconds) || 0);
          setHasStarted(true);
          setCurrentTime(targetSec);
          if (videoRef.current) {
            if (videoRef.current.readyState >= 1) {
              videoRef.current.currentTime = targetSec;
            } else {
              pendingSeekRef.current = targetSec;
            }
            broadcastPlay();
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
            if (onPlay) onPlay();
          }
        },
        play() {
          setHasStarted(true);
          if (videoRef.current) {
            broadcastPlay();
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
            if (onPlay) onPlay();
          }
        },
        pause() {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        },
        get isPlaying() {
          return isPlaying;
        },
        get duration() {
          return videoRef.current?.duration || videoDuration || 0;
        },
        get videoElement() {
          return videoRef.current;
        },
      };
    },
    [onPlay, isPlaying, videoDuration, broadcastPlay]
  );

  // Handle auto-hiding controls during playback
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControlsTemporarily]);

  // Fullscreen change listener (standard + webkit vendor events for iOS Safari)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    const videoEl = videoRef.current;
    const onIosEnterFs = () => setIsFullscreen(true);
    const onIosExitFs = () => setIsFullscreen(false);
    if (videoEl) {
      videoEl.addEventListener('webkitbeginfullscreen', onIosEnterFs);
      videoEl.addEventListener('webkitendfullscreen', onIosExitFs);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      if (videoEl) {
        videoEl.removeEventListener('webkitbeginfullscreen', onIosEnterFs);
        videoEl.removeEventListener('webkitendfullscreen', onIosExitFs);
      }
    };
  }, []);

  // Update initial seek time if specified and video mounted
  useEffect(() => {
    if (initialStart > 0) {
      pendingSeekRef.current = initialStart;
      if (videoRef.current && videoRef.current.readyState >= 1) {
        videoRef.current.currentTime = initialStart;
        setCurrentTime(initialStart);
        pendingSeekRef.current = null;
      }
    }
  }, [initialStart]);

  const handleStartPlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
    broadcastPlay();
    if (videoRef.current) {
      if (videoRef.current.ended || videoRef.current.currentTime >= (videoDuration || 1) - 0.5) {
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      } else if (initialStart > 0 && videoRef.current.currentTime === 0) {
        videoRef.current.currentTime = initialStart;
      }
      videoRef.current.play().catch(() => {});
    }
    if (onPlay) onPlay();
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!hasStarted) {
      handleStartPlay();
      return;
    }
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      broadcastPlay();
      if (videoRef.current.ended || videoRef.current.currentTime >= (videoDuration || 1) - 0.5) {
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (onPlay) onPlay();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleContainerClick = (e) => {
    // If playing and controls are hidden, tapping video reveals controls rather than immediately pausing
    if (isPlaying && !showControls) {
      showControlsTemporarily();
      return;
    }
    togglePlay(e);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    if (onTimeUpdate) {
      onTimeUpdate(cur);
    }

    // Buffer indicator
    if (videoRef.current.buffered.length > 0) {
      try {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const total = videoRef.current.duration || 1;
        setBufferedProgress(Math.min(100, (bufferedEnd / total) * 100));
      } catch {
        // ignore
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (Number.isFinite(dur) && dur > 0) {
        setVideoDuration(dur);
      }
      const seekTarget = pendingSeekRef.current !== null ? pendingSeekRef.current : (initialStart > 0 ? initialStart : null);
      if (seekTarget !== null && seekTarget >= 0) {
        videoRef.current.currentTime = seekTarget;
        setCurrentTime(seekTarget);
        pendingSeekRef.current = null;
      }
    }
  };

  const handleVideoError = () => {
    setIsPlaying(false);
    setHasError(true);
  };

  const handleRetryPlayback = (e) => {
    if (e) e.stopPropagation();
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      broadcastPlay();
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const handleScrubberChange = (e) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleScrubberMouseDown = () => {
    setIsScrubbing(true);
  };

  const handleScrubberMouseUp = () => {
    setIsScrubbing(false);
    if (videoRef.current && isPlaying) {
      broadcastPlay();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleScrubberMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const effectiveDur = videoDuration || 1;
    setHoverTime(pos * effectiveDur);
    setHoverPosition(pos * 100);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      videoRef.current.volume = 0.5;
      setVolume(0.5);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = async (e) => {
    if (e) e.stopPropagation();

    try {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else if (containerRef.current?.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if (videoRef.current?.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (videoRef.current?.webkitExitFullscreen) {
          videoRef.current.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleReplay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleKeyDown = (e) => {
    // Do not intercept arrow keys if focus is on the volume slider
    if (e.target && e.target.getAttribute('aria-label') === 'Volume level') {
      return;
    }
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (videoRef.current) {
        const nextTime = Math.max(0, (videoRef.current.currentTime || 0) - 5);
        videoRef.current.currentTime = nextTime;
        setCurrentTime(nextTime);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (videoRef.current) {
        const maxTime = effectiveDuration > 0 ? effectiveDuration : (videoRef.current.duration || Infinity);
        const nextTime = Math.min(maxTime, (videoRef.current.currentTime || 0) + 5);
        videoRef.current.currentTime = nextTime;
        setCurrentTime(nextTime);
      }
    }
  };

  if (!videoUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-slate-900/90 p-8 text-center text-sm text-slate-400 ${ratioConfig.aspectClass} ${className}`}
        style={{ aspectRatio: ratioConfig.cssRatio }}
      >
        <span>Video not available</span>
      </div>
    );
  }

  const effectiveDuration = videoDuration > 0 ? videoDuration : Number(duration) || 0;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden rounded-2xl bg-black shadow-xl select-none focus:outline-none focus:ring-2 focus:ring-[#B91C3C]/50 ${ratioConfig.aspectClass} ${className}`}
      style={{ aspectRatio: ratioConfig.cssRatio }}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={showControlsTemporarily}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
        setShowVolumeSlider(false);
      }}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Video Player: ${title}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl || undefined}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onSeeked={handleTimeUpdate}
        onProgress={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleVideoError}
        onPlay={() => {
          setIsPlaying(true);
          setHasError(false);
        }}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Poster Facade (Shown before first play if thumbnail available) */}
      {!hasStarted && thumbnailUrl && !posterError && (
        <div className="absolute inset-0 z-10">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            priority={priority}
            unoptimized
            onError={() => setPosterError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent transition-opacity group-hover:opacity-90" />
        </div>
      )}

      {/* Playback Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-25 flex flex-col items-center justify-center bg-black/90 p-4 text-center text-white backdrop-blur-sm">
          <div className="rounded-full bg-red-500/20 p-3 text-red-400 mb-2">
            <RotateCcw className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-white">Video playback failed</p>
          <p className="text-xs text-white/70 mt-1 max-w-xs">
            The media stream could not be loaded. Please check your connection or reload.
          </p>
          <button
            type="button"
            onClick={handleRetryPlayback}
            className="mt-3 rounded-lg bg-[#B91C3C] px-4 py-2 text-xs font-bold text-white hover:bg-[#991530] transition-colors cursor-pointer"
          >
            Retry Playback
          </button>
        </div>
      )}

      {/* Center Big Play Button (when not started or paused) */}
      {(!isPlaying || !hasStarted) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center pointer-events-auto">
            <span className="absolute -inset-3 rounded-full bg-[#B91C3C]/30 opacity-75 blur-sm transition-all duration-300 group-hover:scale-125 group-hover:opacity-100" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!hasStarted) handleStartPlay();
                else togglePlay();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play video'}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#B91C3C] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#991530] focus:outline-none focus:ring-4 focus:ring-[#B91C3C]/50 cursor-pointer"
            >
              <Play className="ml-1 h-7 w-7 fill-white text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Pill (Title & Duration) */}
      {!hasStarted && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="max-w-[70%] truncate rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm shadow">
            {title}
          </div>
          {effectiveDuration > 0 && (
            <div className="rounded-md bg-slate-900/85 px-2.5 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-sm shadow">
              {formatDurationDisplay(effectiveDuration)}
            </div>
          )}
        </div>
      )}

      {/* Branded Control Bar (Overlay at bottom) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber / Progress Bar */}
        <div
          className="relative mb-2 flex h-5 w-full cursor-pointer items-center"
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 rounded bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-sm pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatDurationDisplay(hoverTime)}
            </div>
          )}

          {/* Track Background */}
          <div className="relative h-1.5 w-full rounded-full bg-white/20 transition-all hover:h-2">
            {/* Buffered Progress */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/30"
              style={{ width: `${bufferedProgress}%` }}
            />
            {/* Played Progress (Branded Red #B91C3C) */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#B91C3C]"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber Thumb */}
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md transition-transform hover:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Native Range Input for Universal Accessibility & Scrubbing */}
          <input
            type="range"
            min={0}
            max={effectiveDuration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseDown={handleScrubberMouseDown}
            onMouseUp={handleScrubberMouseUp}
            onTouchStart={handleScrubberMouseDown}
            onTouchEnd={handleScrubberMouseUp}
            aria-label="Seek video playback time"
            aria-valuemin={0}
            aria-valuemax={effectiveDuration}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatDurationDisplay(currentTime)} of ${formatDurationDisplay(effectiveDuration)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          {/* Left Controls: Play/Pause, Replay, Time */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B91C3C]"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              aria-label="Replay from start"
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B91C3C]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Time Elapsed / Duration */}
            <div className="tabular-nums text-xs font-medium text-white/90">
              <span>{formatDurationDisplay(currentTime)}</span>
              <span className="mx-1 text-white/50">/</span>
              <span>{formatDurationDisplay(effectiveDuration)}</span>
            </div>
          </div>

          {/* Right Controls: Volume & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Volume Control with Hover Slider */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {showVolumeSlider && (
                <div className="mr-2 flex items-center rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume level"
                    className="h-1.5 w-16 cursor-pointer accent-[#B91C3C]"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B91C3C]"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B91C3C]"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoFacade;
