import cv2
import base64
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from pathlib import Path
from ultralytics import YOLO

app = FastAPI()

# Load YOLOv8 model 
model = YOLO("E:\ppe_detection_project\models\best.pt")  

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend HTML
@app.get("/")
async def get():
    html_path = Path(__file__).parent / "index.html"
    return HTMLResponse(html_path.read_text())

# WebSocket route for real-time detection
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(0)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            # YOLOv8 detection
            results = model(frame, verbose=False)[0]
            annotated_frame = results.plot()  # Draw bounding boxes on frame

            # Encode and send
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            jpg_as_text = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(jpg_as_text)
            await asyncio.sleep(0.03)  # ~30 FPS
    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        cap.release()
