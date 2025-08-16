export async function deleteMuxAsset(muxId: string) {
  if (!muxId) return;
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('Mux credentials are not configured');
  }
  const auth = Buffer.from(
    `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
  ).toString('base64');
  console.log(`Deleting Mux asset ${muxId}`);
  const resp = await fetch(`https://api.mux.com/video/v1/assets/${muxId}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mux asset deletion failed: ${text}`);
  }
  console.log(`Mux asset ${muxId} deleted`);
}
