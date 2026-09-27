#!/usr/bin/env bash
# Regenerates build/icon.png (1024x1024, transparent corners) from vector primitives.
# Requires ImageMagick. electron-builder converts it to .ico / .icns at package time.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build

convert -size 1024x1024 xc:none -fill '#241D2F' -draw "roundrectangle 0,0,1023,1023,228,228" /tmp/_t0.png
convert -size 1024x1024 gradient:'#2A2236-#130E19' -alpha off /tmp/_bg.png
convert /tmp/_t0.png /tmp/_bg.png -alpha off -compose CopyOpacity -composite /tmp/_tile.png

convert -size 1024x1024 xc:none -stroke white -strokewidth 38 -fill none \
  -draw "stroke-linecap round path 'M 512 716 L 292 448 M 512 716 L 512 352 M 512 716 L 732 448 M 512 352 L 748 246'" \
  -stroke none -fill white \
  -draw "circle 512,716 512,660 circle 292,448 292,392 circle 512,352 512,296 circle 732,448 732,392 circle 748,246 748,204" \
  /tmp/_gw.png

convert -size 1024x1024 gradient:'#F2593F-#F9BE52' -alpha off /tmp/_ink.png
convert /tmp/_ink.png \( /tmp/_gw.png -alpha extract \) -alpha off -compose CopyOpacity -composite /tmp/_glyph.png
convert /tmp/_glyph.png -channel A -blur 0x22 -evaluate multiply 0.5 +channel /tmp/_glow.png
convert /tmp/_tile.png /tmp/_glow.png -compose over -composite /tmp/_t1.png
convert /tmp/_t1.png /tmp/_glyph.png -compose over -composite /tmp/_t2.png
convert /tmp/_t2.png -stroke 'rgba(255,255,255,0.08)' -strokewidth 5 -fill none \
  -draw "roundrectangle 3,3,1020,1020,226,226" build/icon.png

rm -f /tmp/_t0.png /tmp/_bg.png /tmp/_tile.png /tmp/_gw.png /tmp/_ink.png /tmp/_glyph.png /tmp/_glow.png /tmp/_t1.png /tmp/_t2.png
echo "build/icon.png written"
