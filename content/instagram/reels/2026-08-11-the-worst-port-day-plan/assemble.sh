#!/usr/bin/env bash
# Mastercut for 2026-08-11-the-worst-port-day-plan
#
# Builds a silent 1080x1920 H.264 mp4 from the storyboard frames, substituting
# any b-roll you drop into ./footage/ (name clips 01.mp4, 02.mp4 … to match the
# frame they replace). Then open the mp4 in CapCut / Descript / Premiere and
# record your voice-over against it — the cut timings already match transcript.md.
#
#   brew install ffmpeg     # if you don't have it
#   ./assemble.sh
#
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found — run: brew install ffmpeg"; exit 1; }

FRAMES=(
  [ "01" "3.00" ]
  [ "02" "6.00" ]
  [ "03" "7.00" ]
  [ "04" "7.00" ]
  [ "05" "7.00" ]
  [ "06" "7.00" ]
  [ "07" "7.00" ]
  [ "08" "6.00" ]
)

WORK=".assemble"
rm -rf "$WORK"; mkdir -p "$WORK"
i=0
for entry in "${FRAMES[@]}"; do
  read -r n secs <<< "$entry"
  i=$((i+1))
  clip="$WORK/seg_$n.mp4"
  if [ -f "footage/$n.mp4" ]; then
    # Real b-roll: cover-fit to 1080x1920, trim to the frame's duration.
    ffmpeg -y -loglevel error -i "footage/$n.mp4" -t "$secs" \
      -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1" \
      -an -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$clip"
  else
    # No footage yet: hold the storyboard frame as a still.
    ffmpeg -y -loglevel error -loop 1 -t "$secs" -i "frames/$n.jpg" \
      -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf6f1e8,fps=30,setsar=1" \
      -an -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$clip"
  fi
  echo "file '$(basename "$clip")'" >> "$WORK/list.txt"
done

ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/video.mp4"
# Silent stereo track so editors that expect audio don't choke on import.
ffmpeg -y -loglevel error -i "$WORK/video.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo \
  -shortest -c:v copy -c:a aac -b:a 128k "2026-08-11-the-worst-port-day-plan-mastercut.mp4"
rm -rf "$WORK"
echo "✓ 2026-08-11-the-worst-port-day-plan-mastercut.mp4  — talk over this one."
