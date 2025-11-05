#!/bin/bash
# generate_walkthrough.sh
# This script stitches PNG frames in ./frames into a short MP4 using ffmpeg.
# Place numbered frames in the frames/ directory (e.g., 001.png, 002.png ...)
# Requires ffmpeg installed locally.

set -e
FRAMES_DIR="$(dirname "$0")/frames"
OUT_DIR="$(dirname "$0")/out"
mkdir -p "$OUT_DIR"
OUT_MP4="$OUT_DIR/walkthrough.mp4"

# Parameters
FPS=24
DURATION_PER_FRAME=1   # seconds per frame (can adjust by duplicating frames or using complex filters)

# Basic concatenation approach: use image2 demuxer (frames should be sequentially numbered)
# Example filename pattern: frames/%03d.png

echo "Generating video from frames in: $FRAMES_DIR"

ffmpeg -y -framerate $FPS -i "$FRAMES_DIR/%03d.png" -c:v libx264 -pix_fmt yuv420p -r 30 -vf "scale=1280:-2" "$OUT_MP4"

echo "Created $OUT_MP4"

echo "Notes:"
echo " - Ensure frame files are named 001.png, 002.png, ..."
echo " - For narration, record an audio file and use: ffmpeg -i walkthrough.mp4 -i narration.mp3 -c:v copy -c:a aac output_with_audio.mp4"
