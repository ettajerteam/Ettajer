import { buildFounderCardId } from "@/lib/founder/constants";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildFounderCardSvg(name: string, founderNumber: number): string {
  const displayName = escapeXml((name?.trim() || "FOUNDING MERCHANT").toUpperCase());
  const padded = String(founderNumber).padStart(4, "0");
  const cardId = escapeXml(buildFounderCardId(founderNumber));
  const width = 480;
  const height = 303;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050507"/>
      <stop offset="50%" stop-color="#0c0d10"/>
      <stop offset="100%" stop-color="#14151a"/>
    </linearGradient>
    <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#e4e4e7"/>
      <stop offset="50%" stop-color="#fafafa"/>
      <stop offset="65%" stop-color="#a1a1aa"/>
      <stop offset="100%" stop-color="#f4f4f5"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8dc"/>
      <stop offset="30%" stop-color="#e5b05d"/>
      <stop offset="50%" stop-color="#fff5d6"/>
      <stop offset="70%" stop-color="#c5933c"/>
      <stop offset="100%" stop-color="#9a7023"/>
    </linearGradient>
    <linearGradient id="blueGlow" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="18" fill="#000000" opacity="0.35" filter="url(#shadow)"/>
  <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="url(#bg)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="url(#blueGlow)"/>
  <rect x="0" y="0" width="${width}" height="1" fill="rgba(255,255,255,0.28)"/>

  <!-- Logo block -->
  <rect x="28" y="28" width="44" height="44" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
  <text x="50" y="58" text-anchor="middle" fill="url(#foil)" font-family="Arial, sans-serif" font-size="18" font-weight="800">E</text>
  <text x="82" y="46" fill="url(#foil)" font-family="Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="3">ETTAJER</text>
  <text x="82" y="62" fill="#71717a" font-family="Arial, sans-serif" font-size="9" letter-spacing="1">التاجر</text>

  <!-- Title -->
  <text x="${width - 28}" y="42" text-anchor="end" fill="url(#foil)" font-family="Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="2.2">FOUNDING MERCHANT</text>
  <text x="${width - 28}" y="58" text-anchor="end" fill="#52525b" font-family="monospace" font-size="8" letter-spacing="1.5">EST. 2026</text>

  <!-- Founder badge -->
  <rect x="${width / 2 - 88}" y="88" width="176" height="28" rx="14" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)"/>
  <circle cx="${width / 2 - 68}" cy="102" r="3" fill="#fbbf24"/>
  <text x="${width / 2}" y="107" text-anchor="middle" fill="url(#gold)" font-family="monospace" font-size="11" font-weight="700" letter-spacing="1.2">FOUNDER #${padded}</text>

  <!-- Chip -->
  <rect x="28" y="138" width="52" height="38" rx="7" fill="url(#gold)" stroke="#7a5b12" stroke-width="1"/>
  <line x1="28" y1="151" x2="80" y2="151" stroke="#7a5b12" stroke-width="1"/>
  <line x1="28" y1="163" x2="80" y2="163" stroke="#7a5b12" stroke-width="1"/>
  <line x1="44" y1="138" x2="44" y2="176" stroke="#7a5b12" stroke-width="1"/>
  <line x1="64" y1="138" x2="64" y2="176" stroke="#7a5b12" stroke-width="1"/>

  <!-- Hologram -->
  <circle cx="${width - 48}" cy="157" r="18" fill="rgba(59,130,246,0.2)" stroke="rgba(255,255,255,0.2)"/>
  <text x="${width - 48}" y="161" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="7" font-weight="700">100</text>

  <!-- Card ID -->
  <text x="28" y="210" fill="#a1a1aa" font-family="monospace" font-size="10" letter-spacing="1.4">${cardId}</text>

  <!-- Name -->
  <text x="28" y="232" fill="#71717a" font-family="Arial, sans-serif" font-size="7" font-weight="700" letter-spacing="1.8">CARDHOLDER</text>
  <text x="28" y="252" fill="#ffffff" font-family="Arial, sans-serif" font-size="15" font-weight="600" letter-spacing="0.8">${displayName.length > 24 ? displayName.slice(0, 24) + "…" : displayName}</text>
  <line x1="28" y1="264" x2="48" y2="264" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="54" y="268" fill="#93c5fd" font-family="Arial, sans-serif" font-size="8" font-weight="600" letter-spacing="1.6">EARLY ACCESS MEMBER</text>

  <!-- Seal -->
  <circle cx="${width - 58}" cy="238" r="34" fill="url(#gold)" stroke="#e5b242" stroke-width="1" stroke-dasharray="3 2"/>
  <circle cx="${width - 58}" cy="238" r="26" fill="none" stroke="#b45309" stroke-width="1" opacity="0.45"/>
  <text x="${width - 58}" y="244" text-anchor="middle" fill="#b45309" font-family="monospace" font-size="12" font-weight="800">${padded}</text>
</svg>`;
}
