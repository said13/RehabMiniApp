import { useEffect, useRef } from 'react';

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

  return (
    <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', background: '#000' }} />
  );
}

export default PlaylistPlayer;

