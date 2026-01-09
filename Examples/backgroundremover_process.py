#!/usr/bin/env python3
"""
Remove background from all frames using backgroundremover library
https://github.com/nadermx/backgroundremover
"""
import os
from pathlib import Path
from backgroundremover.bg import remove

def process_frame(input_path, output_path):
    """Process a single frame"""
    print(f"Processing {os.path.basename(input_path)}...", end=" ", flush=True)
    
    try:
        # Read input image
        with open(input_path, "rb") as f:
            input_data = f.read()
        
        # Remove background (transparent by default)
        output_data = remove(input_data, model_name="u2net")
        
        # Save output
        with open(output_path, "wb") as f:
            f.write(output_data)
        
        print("✓")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    input_dir = Path("trophy_frames")
    output_dir = Path("trophy_frames_no_bg")
    
    output_dir.mkdir(exist_ok=True)
    
    frames = sorted(input_dir.glob("frame_*.png"))
    total = len(frames)
    
    print(f"Processing {total} frames with backgroundremover...")
    print(f"This may take a while as it downloads models on first run.\n")
    
    successful = 0
    failed = 0
    
    for idx, frame_path in enumerate(frames, 1):
        output_path = output_dir / frame_path.name
        print(f"[{idx}/{total}] ", end="")
        
        if process_frame(frame_path, output_path):
            successful += 1
        else:
            failed += 1
    
    print()
    print(f"Completed: {successful} successful, {failed} failed")

if __name__ == "__main__":
    main()
