import cv2
import os
import time
from datetime import datetime
from ultralytics import YOLO

# === Paths ===
model_path = "E:\ppe_detection_project\models\best.pt"
log_file = "violation_logs.csv"
screenshot_folder = "violation_screenshots"
log_cooldown = 180  # seconds

# === Internal State ===
last_logged = {}

# === File system prep ===
os.makedirs(screenshot_folder, exist_ok=True)
if not os.path.exists(log_file):
    with open(log_file, "w") as f:
        f.write("timestamp,violation_type,total_people\n")

# === Load model ===
model = YOLO(model_path)

# === Start Webcam ===
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_small = cv2.resize(frame, (640, 480))
    annotated_frame = frame_small.copy()

    try:
        results = model.predict(source=frame_small, conf=0.5, stream=True, verbose=False)

        for r in results:
            boxes = r.boxes
            class_ids = boxes.cls.cpu().numpy().astype(int)
            confs = boxes.conf.cpu().numpy()
            xyxys = boxes.xyxy.cpu().numpy()
            names = r.names

            total_people = 0

            for box, conf, class_id in zip(xyxys, confs, class_ids):
                label = names[class_id]
                x1, y1, x2, y2 = map(int, box)
                conf_text = f"{label} ({conf:.2f})"

                # Count people
                if "person" in label.lower():
                    total_people += 1

                # Determine color
                if "no" in label.lower():
                    color = (0, 0, 255)  # red for violation
                else:
                    color = (0, 255, 0)  # green for compliant

                # Draw box and label for all detections (with conf)
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(annotated_frame, conf_text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                # Handle logging for violations
                if "no" in label.lower():
                    now = datetime.now()
                    violation_type = label
                    last_time = last_logged.get(violation_type)

                    if last_time is None or (now - last_time).total_seconds() > log_cooldown:
                        timestamp_str = now.strftime("%Y-%m-%d_%H-%M-%S")
                        screenshot_path = os.path.join(
                            screenshot_folder, f"{timestamp_str}_{violation_type}.jpg"
                        )
                        cv2.imwrite(screenshot_path, annotated_frame)

                        with open(log_file, "a") as f:
                            log_entry = f"{now.strftime('%Y-%m-%d %H:%M:%S')},{violation_type},{total_people}\n"
                            f.write(log_entry)

                        print(f"[LOGGED] {violation_type} ({conf:.2f}) at {timestamp_str}")
                        last_logged[violation_type] = now

        cv2.imshow("YOLOv8 PPE Detection", annotated_frame)

    except Exception as e:
        print(f"[ERROR] {e}")
        break

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    time.sleep(0.1)

cap.release()
cv2.destroyAllWindows()
