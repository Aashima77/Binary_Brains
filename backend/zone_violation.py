import cv2
import numpy as np
import csv
import os
from datetime import datetime, timedelta
from shapely.geometry import Point, Polygon
from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO("E:\ppe_detection_project\models\best.pt")

# Define zone using coordinates
zone_points = [(100, 100), (400, 100), (400, 400), (100, 400)]
zone_polygon_np = np.array(zone_points, np.int32).reshape((-1, 1, 2))
zone_polygon_shape = Polygon(zone_points)

# Class names
class_names = model.names

# Set up webcam
cap = cv2.VideoCapture(0)
print("🟦 Predefined Zone Monitoring Activated...\n")

# Create folders if not exist
os.makedirs("logs", exist_ok=True)
os.makedirs("screenshots", exist_ok=True)

# CSV logging file path
csv_path = "logs/zone_violations.csv"
if not os.path.exists(csv_path):
    with open(csv_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Timestamp", "Violation_Type"])

# Cooldown setup
last_violation_time = datetime.min  # initialize to earliest possible time
cooldown_seconds = 180

while True:
    ret, frame = cap.read()
    if not ret:
        break

    zone_violation_detected = False
    violation_type = None

    results = model(frame)[0]
    cv2.polylines(frame, [zone_polygon_np], isClosed=True, color=(255, 0, 0), thickness=2)

    for box in results.boxes.data:
        x1, y1, x2, y2, conf, cls_id = box.tolist()
        cls_id = int(cls_id)
        label = class_names[cls_id]

        # Draw bounding box with label and confidence
        color = (0, 255, 0) if "NO" not in label else (0, 0, 255)
        conf_text = f"{label} ({conf:.2f})"
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
        cv2.putText(frame, conf_text, (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        if label == "Person":
            center_x = (x1 + x2) / 2
            center_y = (y1 + y2) / 2
            center_point = Point(center_x, center_y)
            cv2.circle(frame, (int(center_x), int(center_y)), 5, (0, 255, 255), -1)

            if zone_polygon_shape.contains(center_point):
                zone_violation_detected = True
                violation_type = "Person in Restricted Zone"
                cv2.putText(frame, "ZONE VIOLATION", (int(x1), int(y2) + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    if zone_violation_detected:
        cv2.putText(frame, " ALERT: ZONE VIOLATION DETECTED", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 3)

        now = datetime.now()
        if (now - last_violation_time).total_seconds() >= cooldown_seconds:
            last_violation_time = now

            # Save screenshot
            timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")
            screenshot_path = f"screenshots/violation_{timestamp}.png"
            cv2.imwrite(screenshot_path, frame)

            # Log to CSV
            with open(csv_path, mode="a", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([timestamp, violation_type])

    cv2.imshow("PPE Detection + Zone Violation", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
