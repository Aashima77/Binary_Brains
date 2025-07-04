import cv2
import os
from datetime import datetime
import pyttsx3
import playsound
import json
from twilio.rest import Client
import smtplib
from email.mime.text import MIMEText

# === Configuration ===
CONFIDENCE_THRESHOLD = 0.6
ALERT_SOUND_PATH = r"D:\BinaryBrains\alarm2.mp3"   # ✅ Ensure path & file exist
SAVE_DIR = "violations"
VIOLATION_LABELS = ["no_helmet", "no_vest", "no_mask", "no_gloves", "no_goggles"]

# Twilio WhatsApp config
TWILIO_SID = 'AC3018454b3beecb7ca89df267c58125c6'
TWILIO_AUTH_TOKEN = '018920adf4028898a5cb2f50a0d912b6'
TWILIO_SANDBOX_NUMBER = 'whatsapp:+14155238886'
TO_WHATSAPP_NUMBER = 'whatsapp:+917976229497'

# Gmail config
FROM_EMAIL = "khushalnagal512@gmail.com"
APP_PASSWORD = "your password"
TO_EMAIL = "khushalnagal512@gmail.com"  # Can be same or different

# Init folders & TTS
os.makedirs(SAVE_DIR, exist_ok=True)
tts_engine = pyttsx3.init()
tts_engine.setProperty("rate", 200)

# === Alert Functions ===
def play_alert_sound():
    try:
        playsound.playsound(ALERT_SOUND_PATH)
    except Exception as e:
        print(f"[SOUND] Error playing sound: {e}")

def speak_alert(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

def send_whatsapp_alert(message):
    try:
        client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=TWILIO_SANDBOX_NUMBER,
            to=TO_WHATSAPP_NUMBER
        )
        print(f"[WHATSAPP] Sent. SID: {msg.sid}")
    except Exception as e:
        print(f"[WHATSAPP] Error: {e}")

def send_email_alert(subject, body, to_email="khushalnagal@gmail.com"):
    from_email = "khushalnagal@gmail.com"
    app_password = "vnjqbfjfyxcozdje"  # ✅ Your 16-char Gmail App Password (no spaces)

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(from_email, app_password)
        server.send_message(msg)
        server.quit()
        print("[EMAIL] Alert email sent ✅")
    except Exception as e:
        print(f"[EMAIL] Failed to send email ❌ → {e}")
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(FROM_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("[EMAIL] Alert email sent ✅")
    except Exception as e:
        print(f"[EMAIL] Failed to send email ❌ → {e}")

def save_snapshot(frame, location):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{SAVE_DIR}/violation_{timestamp}.jpg"
    cv2.imwrite(filename, frame)
    metadata = {
        "timestamp": timestamp,
        "location": location,
        "file": filename
    }
    with open(f"{filename}.json", "w") as f:
        json.dump(metadata, f, indent=2)

def check_violation(label, confidence, frame, violated_labels, location="Zone 1"):
    if label in VIOLATION_LABELS and confidence >= CONFIDENCE_THRESHOLD:
        save_snapshot(frame, location)
        print(f"[ALERT] Violation: {label} | Confidence: {confidence:.2f}")
        violated_labels.append(label)
    else:
        print(f"[INFO] Safe or below threshold → Label: {label}, Confidence: {confidence:.2f}")

# === MAIN EXECUTION ===

# Sample detections
detections = [
    {"label": "no_mask", "confidence": 0.91},
    {"label": "no_helmet", "confidence": 0.85},
]

# Test image
frame = cv2.imread("Testing_Image.jpg")
violated_labels = []

# Process detections
for det in detections:
    check_violation(det["label"], det["confidence"], frame, violated_labels)

# Final Combined Alert
if violated_labels:
    readable = [label.replace("no_", "").capitalize() for label in violated_labels]

    if len(readable) == 1:
        alert_text = f"Warning! {readable[0]} not detected."
    elif len(readable) == 2:
        alert_text = f"Warning! {readable[0]} and {readable[1]} both are not detected."
    else:
        all_but_last = ", ".join(readable[:-1])
        alert_text = f"Warning! {all_but_last}, and {readable[-1]} are not detected."

    play_alert_sound()
    speak_alert(alert_text)
    send_whatsapp_alert("🚨 abhi to sirf warning de rha hun aage se gaali padegi, " + alert_text)
    send_email_alert("🚨 PPE Violation Alert", alert_text)
