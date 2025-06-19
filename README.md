# VisionAI: Real-Time PPE Detection and Behavior Monitoring

**AI Summer of Code Project by `<p>` Club**

VisionAI is an AI-powered surveillance system built to enhance workplace safety in industrial and high-risk environments. It uses real-time computer vision to detect Personal Protective Equipment (PPE) violations and monitor unsafe behaviors through live video feeds.

## 💡 What It Does

- **Real-Time PPE Detection**  
  Identifies missing safety gear (helmets, vests, gloves) using YOLOv8.

- **Instant Alerts**  
  Sends real-time notifications and plays voice warnings through camera speakers.

- **Incident Logging**  
  Saves cropped violation images with timestamps and metadata for future reference.

- **Unsafe Behavior Monitoring**  
  Detects abnormal actions such as running, falling, or limping through gait analysis.

- **Access Control & Attendance**  
  Uses facial recognition to track attendance and restrict unauthorized access.

- **Zone-Based Safety Enforcement**  
  Detects and logs restricted area violations.

##*: FastAPI, SQLite (with future PostgreSQL upgrade)  
- **Frontend**: React.js, Tailwind CSS  
- **Alert System**: pyttsx3 for TTS, optional buzzer integration  
- **Storage**: Local + Google Drive (for cropped violations)

## 📌 Why It Matters

Traditional CCTV systems are passive and rely heavily on manual review. VisionAI transforms this by actively enforcing safety rules, reducing response time, and ensuring accountability — making workplaces smarter and safer.

---

Stay tuned for updates as we continue to build a deployable, scalable, and intelligent safety compliance system.


