import cv2
import numpy as np
from shapely.geometry import Point, Polygon
from datetime import datetime
import os
import pyttsx3
import playsound
import json
import smtplib
from email.mime.text import MIMEText
import requests

# === Configuration ===
CONFIDENCE_THRESHOLD = 0.6  # Placeholder for model confidence filtering (not used here)
ALERT_SOUND_PATH = r"D:\BinaryBrains\alarm2.mp3"  # Path to alarm sound
SAVE_DIR = "violations"  # Directory to save snapshots and logs
os.makedirs(SAVE_DIR, exist_ok=True)

# WhatsApp API credentials (set these from a secure location in production)
ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID'
TO_NUMBER = '91XXXXXXXXXX'

# Text-to-Speech engine initialization
tts_engine = pyttsx3.init()
tts_engine.setProperty("rate", 200)  # Speech speed

# Define restricted area as a polygon
zone_coords = [(100, 100), (300, 100), (300, 300), (100, 300)]
zone_polygon = Polygon(zone_coords)

# Simulated detections: list of people with bounding boxes
person_detections = [
    {"id": 1, "box": (150, 150, 200, 250)},  # Inside restricted zone
    {"id": 2, "box": (400, 400, 450, 470)}   # Outside zone
]

# === Alert Mechanisms ===

def play_alert_sound():
    """Play a predefined alert sound."""
    try:
        playsound.playsound(ALERT_SOUND_PATH)
    except Exception as e:
        print(f"[SOUND] Error: {e}")

def speak_alert(text):
    """Use text-to-speech to speak alert."""
    tts_engine.say(text)
    tts_engine.runAndWait()

def send_whatsapp_alert(message):
    """Send WhatsApp alert via Meta Graph API."""
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": TO_NUMBER,
        "type": "text",
        "text": {"body": message}
    }
    try:
        r = requests.post(url, headers=headers, json=payload)
        print("[WHATSAPP]", r.status_code, r.text)
    except Exception as e:
        print("[WHATSAPP] Error:", e)

def send_email_alert(subject, body, to_email="your@email.com"):
    """Send email alert with SMTP."""
    from_email = "your@email.com"
    app_password = "your_app_password"  # Use app-specific password for Gmail

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(from_email, app_password)
        server.send_message(msg)
        server.quit()
        print("[EMAIL] Sent")
    except Exception as e:
        print("[EMAIL] Error:", e)

def save_snapshot(image, location="Zone 1"):
    """Save image and metadata when violation occurs."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{SAVE_DIR}/zone_violation_{timestamp}.jpg"
    cv2.imwrite(filename, image)

    metadata = {
        "timestamp": timestamp,
        "location": location,
        "file": filename
    }

    with open(f"{filename}.json", "w") as f:
        json.dump(metadata, f, indent=2)

# === Zone Violation Detection Logic ===

frame = cv2.imread("Testing_Image.jpg")  # Load test frame (replace with video/camera feed)
violators = []  # Store IDs of violators

# Check each person if they're inside the restricted zone
for person in person_detections:
    x1, y1, x2, y2 = person["box"]
    center = ((x1 + x2) // 2, (y1 + y2) // 2)  # Midpoint of bounding box
    point = Point(center)

    if zone_polygon.contains(point):
        violators.append(person["id"])
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # Red box
        cv2.circle(frame, center, 5, (0, 255, 255), -1)  # Yellow center dot

# Draw the restricted zone on the image
cv2.polylines(frame, [np.array(zone_coords, dtype=np.int32)], isClosed=True, color=(0, 255, 0), thickness=2)

# If violation is detected, trigger alerts
if violators:
    alert_msg = f"⚠️ Zone Violation: Persons {violators} entered restricted area."
    print(alert_msg)
    save_snapshot(frame)
    play_alert_sound()
    speak_alert("Alert! A person has entered the restricted zone!")
    send_whatsapp_alert(alert_msg)
    send_email_alert("Zone Violation Alert", alert_msg)

# Show the result (for debugging/viewing)
cv2.imshow("Zone Detection", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()
