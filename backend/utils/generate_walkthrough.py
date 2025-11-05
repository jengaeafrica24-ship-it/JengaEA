import os
import json
import time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess

# Configure walkthrough settings
FRAMES_DIR = Path("walkthrough_frames")
TRANSITIONS_DIR = Path("transitions")
OUTPUT_VIDEO = "platform_walkthrough.mp4"
FPS = 30  # Higher FPS for smoother transitions
TRANSITION_DURATION = 0.5  # seconds

# Styling
RESOLUTION = (1920, 1080)
FONT_SIZE = 32
TEXT_COLOR = (255, 255, 255)
OVERLAY_BG = (0, 0, 0, 128)

# Walkthrough storyboard - each frame defines a key feature to showcase
STORYBOARD = [
    {
        "name": "1_landing",
        "title": "Welcome to JengaEST",
        "description": "Construction cost estimation made simple",
        "duration": 3  # seconds to show this frame
    },
    {
        "name": "2_register",
        "title": "Quick Registration",
        "description": "Create your account in seconds",
        "duration": 2
    },
    {
        "name": "3_dashboard",
        "title": "Your Dashboard",
        "description": "Overview of your projects and estimates",
        "duration": 3
    },
    {
        "name": "4_new_estimate",
        "title": "Create New Estimate",
        "description": "Choose manual entry or Excel upload",
        "duration": 3
    },
    {
        "name": "5_excel_upload",
        "title": "Excel Upload",
        "description": "Drag and drop your Excel file",
        "duration": 3
    },
    {
        "name": "6_validation",
        "title": "Smart Validation",
        "description": "Instant feedback on your data",
        "duration": 2
    },
    {
        "name": "7_reports",
        "title": "Detailed Reports",
        "description": "Generate professional cost reports",
        "duration": 3
    }
]

def create_frame_list():
    """Create a text file listing all frames for ffmpeg"""
    frames_file = Path("frames.txt")
    with frames_file.open("w") as f:
        for frame in STORYBOARD:
            # Each frame will be repeated based on duration * FPS
            repeat_count = frame["duration"] * FPS
            for _ in range(repeat_count):
                f.write(f"file '{FRAMES_DIR}/{frame['name']}.png'\n")

def generate_ffmpeg_command():
    """Generate the ffmpeg command to create the video"""
    return (
        f"ffmpeg -y -f concat -i frames.txt "
        f"-c:v libx264 -pix_fmt yuv420p "
        f"-vf \"fps={FPS},format=yuv420p\" "
        f"-movflags +faststart {OUTPUT_VIDEO}"
    )

def main():
    # Create frames directory if it doesn't exist
    FRAMES_DIR.mkdir(exist_ok=True)
    
    # Save storyboard for reference
    with open("storyboard.json", "w") as f:
        json.dump(STORYBOARD, f, indent=2)
    
    # Create frame list for ffmpeg
    create_frame_list()
    
    # Generate and print ffmpeg command
    ffmpeg_cmd = generate_ffmpeg_command()
    print("\nTo create your walkthrough video:")
    print("1. Add your screenshot frames to the walkthrough_frames/ directory")
    print("   Name them according to the storyboard (e.g., 1_landing.png)")
    print("\n2. Run this ffmpeg command:")
    print(ffmpeg_cmd)
    
    print("\nFrames needed:")
    for frame in STORYBOARD:
        print(f"- {frame['name']}.png: {frame['description']}")

if __name__ == "__main__":
    main()