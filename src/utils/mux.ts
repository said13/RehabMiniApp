export async function deleteMuxAsset(muxId: string) {
  if (!muxId) return;
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.warn('Mux credentials are not configured');
    return;
  }
  const auth = Buffer.from(
    `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
  ).toString('base64');
  try {
    console.log(`Deleting Mux asset ${muxId}`);
    const resp = await fetch(`https://api.mux.com/video/v1/assets/${muxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Mux asset deletion failed', text);
    } else {
      console.log(`Mux asset ${muxId} deleted`);
    }
  } catch (e) {
    console.error('Failed to delete Mux asset', e);
  }
}
