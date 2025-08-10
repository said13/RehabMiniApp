import { useEffect, useRef, useState } from 'react';
import Loader from './Loader';

// Use global Hls from CDN if available
declare global {
  interface Window { Hls?: any; }
}

export interface PlaylistItem {
  id?: string; // Mux Playback ID
  url?: string; // full .m3u8 URL
  token?: string; // optional signed token
  title?: string;
}

interface PlaylistPlayerProps {
  playlist: PlaylistItem[];
  index: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function PlaylistPlayer({ playlist, index, autoplay = true, loop = true, muted = false }: PlaylistPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const waitingTimer = useRef<NodeJS.Timeout | null>(null);

  // Load hls.js script once if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Hls) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Build playback URL from item
  const buildSrc = (item: PlaylistItem) => {
    if (item.url) {
      if (item.token && !/[?&]token=/.test(item.url)) {
        return item.url + (item.url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(item.token);
      }
      return item.url;
    }
    let u = `https://stream.mux.com/${item.id}.m3u8`;
    if (item.token) u += `?token=${encodeURIComponent(item.token)}`;
    return u;
  };

  // Load video when index changes
  useEffect(() => {
    const video = videoRef.current;
    const item = playlist[index];
    if (!video || !item || typeof window === 'undefined') return;

    const src = buildSrc(item);

    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch (e) {}
      hlsRef.current = null;
    }

    const hlsConfig = { maxBufferLength: 120, backBufferLength: 90, capLevelOnFPSDrop: true };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src; // Safari / iOS
      if (autoplay) video.play().catch(() => {});
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsRef.current = new window.Hls(hlsConfig);
      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);
      hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) video.play().catch(() => {});
      });
    } else {
      console.error('HLS is not supported in this browser.');
    }

    setLoading(true);
  }, [playlist, index, autoplay]);

  // Apply mute/loop/autoplay changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.loop = loop;
    if (autoplay) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [muted, loop, autoplay, index]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch (e) {}
        hlsRef.current = null;
      }
    };
  }, []);

  // Handle buffering and events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const clearWaiting = () => {
      if (waitingTimer.current) {
        clearTimeout(waitingTimer.current);
        waitingTimer.current = null;
      }
    };

    const hideIfBuffered = () => {
      const b = video.buffered;
      for (let i = 0; i < b.length; i++) {
        if (b.start(i) <= video.currentTime && b.end(i) - video.currentTime >= 3) {
          setLoading(false);
          break;
        }
      }
    };

    const onPlay = () => setLoading(true);
    const onWaiting = () => {
      clearWaiting();
      waitingTimer.current = setTimeout(() => {
        if (!video.paused && !video.ended) setLoading(true);
      }, 200);
    };
    const onCanPlay = () => {
      clearWaiting();
      setLoading(false);
    };
    const onPlaying = () => {
      clearWaiting();
      setLoading(false);
      setHasError(false);
    };
    const onError = () => {
      clearWaiting();
      setHasError(true);
      setLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    video.addEventListener('timeupdate', hideIfBuffered);
    video.addEventListener('progress', hideIfBuffered);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      video.removeEventListener('timeupdate', hideIfBuffered);
      video.removeEventListener('progress', hideIfBuffered);
      clearWaiting();
    };
  }, [index]);

  const handleRetry = () => {
    const v = videoRef.current;
    if (!v) return;
    setHasError(false);
    setLoading(true);
    v.load();
    v.play().catch(() => {});
  };

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', background: '#000' }} />
      <Loader active={loading} mode="local" />
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
          <div className="mb-4">Video failed to load</div>
          <button className="px-4 py-2 bg-white/20 rounded" onClick={handleRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}

export default PlaylistPlayer;

