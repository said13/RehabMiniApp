export function EmbedPlayer({ src, placeholderTitle, autoplay = true, muted = false, showControls = false }: { src: string; placeholderTitle?: string; autoplay?: boolean; muted?: boolean; showControls?: boolean }) {
  console.log('[EmbedPlayer] Incoming src:', src);

  const isMux = (u: string) => {
    const match = /^https:\/\/player\.mux\.com\//.test(u);
    if (!match) {
      console.warn('[EmbedPlayer] Not a Mux URL:', u);
    }
    return match;
  };

  const ensureParams = (u: string) => {
    try {
      const url = new URL(u);
      url.searchParams.set('autoplay', autoplay ? '1' : '0');
      url.searchParams.set('muted', muted ? '1' : '0');
      url.searchParams.set('playsinline', '1');
      url.searchParams.set('controls', showControls ? '1' : '0');
      return url.toString();
    } catch (err) {
      console.error('[EmbedPlayer] Invalid video URL:', u, err);
      return u;
    }
  };

  if (!src) {
    console.error('[EmbedPlayer] No src provided at all.');
  }

  const mux = src && isMux(src) ? ensureParams(src) : null;

  if (!mux) {
    console.warn('[EmbedPlayer] Mux URL could not be resolved. Falling back to placeholder.');
  }

  const iframeSrc = mux || 'https://player.mux.com/6ndHuwoLUZl36fI00EiZap9gt02vGFTxZx3IDLSGfXC700';
  console.log('[EmbedPlayer] Final iframe src:', iframeSrc);

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <iframe
        src={iframeSrc}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={placeholderTitle || 'Video'}
      />
    </div>
  );
}
