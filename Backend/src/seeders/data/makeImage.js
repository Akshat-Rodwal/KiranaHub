const svgToDataUri = (svg) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/**
 * Builds a deterministic placeholder-style SVG data URI for a product or
 * category image, in the same visual language as the frontend mock data.
 * Keeping images as inline SVG data URIs guarantees no broken external URLs.
 */
const makeImage = (label, primary, secondary) => {
  const initials = label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="175" r="82" fill="rgba(255,255,255,0.18)"/><text x="200" y="192" font-family="Arial,Helvetica,sans-serif" font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text><text x="200" y="330" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="500" fill="rgba(255,255,255,0.92)" text-anchor="middle">${label}</text></svg>`;

  return svgToDataUri(svg);
};

export default makeImage;
