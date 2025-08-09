export function placeholderThumb(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='${color}'/><stop offset='100%' stop-color='#111'/></linearGradient></defs><rect width='160' height='90' rx='12' fill='url(#g)'/><g fill='white' opacity='.9'><circle cx='70' cy='45' r='14'/><polygon points='68,37 84,45 68,53' fill='white'/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function placeholderProduct(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='#374151'/><stop offset='100%' stop-color='#1f2937'/></linearGradient></defs><rect width='120' height='120' rx='16' fill='url(#g)'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='40' font-family='Arial' fill='#e5e7eb'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
