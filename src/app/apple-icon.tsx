import { ImageResponse } from "next/og";
import { G_PATH, KEY_POINTS, SEAM_PATH, SLASH_PATH } from "@/components/ui/guildryMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the block is a full square.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs><mask id="k" maskUnits="userSpaceOnUse" x="-20" y="-20" width="160" height="160">
<rect x="-20" y="-20" width="160" height="160" fill="#fff"/>
<path d="${SEAM_PATH}" fill="none" stroke="#000" stroke-width="2.6"/>
<polygon points="${KEY_POINTS}" fill="none" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/>
<path d="${SLASH_PATH}" fill="none" stroke="#000" stroke-width="3.2"/>
</mask></defs>
<rect width="120" height="120" fill="#A8502F"/>
<g transform="translate(22 23) scale(0.62)"><path d="${G_PATH}" fill="#F4F1E8" stroke="#F4F1E8" stroke-width="5" stroke-linejoin="round" mask="url(#k)"/></g>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`data:image/svg+xml,${encodeURIComponent(svg)}`} width={180} height={180} alt="" />
    ),
    { ...size },
  );
}
