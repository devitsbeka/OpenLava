#!/usr/bin/env python3
"""
Remove background from all frames using LightX API
"""
import os
import json
import time
import requests
from pathlib import Path

API_KEY = "aad97ae8f1814c23b3b9568d21a78263_aefb5ee2704442459688c3ac37a60396_andoraitools"
UPLOAD_URL = "https://api.lightxeditor.com/external/api/v2/uploadImageUrl"
REMOVE_BG_URL = "https://api.lightxeditor.com/external/api/v2/remove-background"
STATUS_URL = "https://api.lightxeditor.com/external/api/v2/order-status"

def upload_image(image_path):
    """Upload image and get imageUrl"""
    image_path_str = str(image_path)
    file_size = os.path.getsize(image_path_str)
    content_type = "image/png" if image_path_str.endswith(".png") else "image/jpeg"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    data = {
        "uploadType": "imageUrl",
        "size": file_size,
        "contentType": content_type
    }
    
    response = requests.post(UPLOAD_URL, headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    
    if result.get("statusCode") != 2000:
        raise Exception(f"Upload failed: {result}")
    
    upload_image_url = result["body"]["uploadImage"]
    image_url = result["body"]["imageUrl"]
    
    # Upload the actual image file
    with open(image_path_str, "rb") as f:
        upload_response = requests.put(upload_image_url, data=f, headers={"Content-Type": content_type})
        upload_response.raise_for_status()
    
    return image_url

def remove_background(image_url):
    """Request background removal"""
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    data = {
        "imageUrl": image_url,
        "background": "transparent"  # Request transparent background
    }
    
    response = requests.post(REMOVE_BG_URL, headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    
    if result.get("statusCode") != 2000:
        raise Exception(f"Remove BG request failed: {result}")
    
    return result["body"]["orderId"]

def check_status(order_id):
    """Check order status and return result when ready"""
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    data = {
        "orderId": order_id
    }
    
    max_retries = 5
    for attempt in range(max_retries):
        response = requests.post(STATUS_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if result.get("statusCode") != 2000:
            raise Exception(f"Status check failed: {result}")
        
        status = result["body"]["status"]
        
        if status == "active":
            return result["body"]["output"]
        elif status == "failed":
            raise Exception(f"Background removal failed for order {order_id}")
        elif status == "init":
            if attempt < max_retries - 1:
                time.sleep(3)  # Wait 3 seconds before retry
                continue
            else:
                raise Exception(f"Timeout waiting for order {order_id}")
    
    raise Exception(f"Max retries exceeded for order {order_id}")

def process_frame(input_path, output_path):
    """Process a single frame"""
    print(f"Processing {os.path.basename(input_path)}...")
    
    try:
        # Upload image
        print(f"  Uploading...")
        image_url = upload_image(input_path)
        
        # Request background removal
        print(f"  Requesting background removal...")
        order_id = remove_background(image_url)
        
        # Poll for status
        print(f"  Waiting for processing (order: {order_id})...")
        output_url = check_status(order_id)
        
        # Download result
        print(f"  Downloading result...")
        response = requests.get(output_url)
        response.raise_for_status()
        
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"  ✓ Completed: {os.path.basename(output_path)}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    input_dir = Path("trophy_frames")
    output_dir = Path("trophy_frames_lightx")
    
    output_dir.mkdir(exist_ok=True)
    
    frames = sorted(input_dir.glob("frame_*.png"))
    total = len(frames)
    
    print(f"Processing {total} frames with LightX API...")
    print(f"Estimated time: ~{total * 20 / 60:.1f} minutes")
    print()
    
    successful = 0
    failed = 0
    
    for idx, frame_path in enumerate(frames, 1):
        output_path = output_dir / frame_path.name
        print(f"[{idx}/{total}] ", end="")
        
        if process_frame(frame_path, output_path):
            successful += 1
        else:
            failed += 1
        
        # Small delay between requests to avoid rate limiting
        if idx < total:
            time.sleep(1)
    
    print()
    print(f"Completed: {successful} successful, {failed} failed")

if __name__ == "__main__":
    main()
