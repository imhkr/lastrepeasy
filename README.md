# FormFlow AI — Jeff Nippard Workout Biomechanics & Step-by-Step Flow Video Generator

**FormFlow AI** is an Android mobile application (React Native / Expo) paired with a Python AI Biomechanics & Video Rendering backend (FastAPI + MediaPipe Pose + Gemini Multimodal AI + OpenCV/FFmpeg).

Share any **Jeff Nippard YouTube / Shorts workout URL** or **upload your own gym workout video**, and FormFlow AI will:
1. **Point out every critical biomechanical position & angle**:
   - **Elbow Angle** (`shoulder -> elbow -> wrist`) for scapular-plane path vs. forearm curling
   - **Handle Position & Hand/Wrist Stack Angle** (`elbow -> wrist -> index knuckle`) to verify neutral wrist alignment (`170°–180°`) and proper grip attachment (e.g., Neutral MAG grip, rope, rotating D-handle, or 15° pronated press grip)
   - **Shoulder Plane & Torso Inclination Angle** (e.g., `~30°` torso lean for optimal iliac lat fiber alignment or `30°` bench inclination for clavicular pec targeting)
   - **Foot, Knee & Ankle Base Angle** (`knee -> ankle -> foot_index`) to verify `~82°–86°` ankle dorsiflexion and planted heel stability
2. **Generate a Step-by-Step Exercise Start-to-End Flow Video**:
   - Automatically segments the exercise into **5 canonical execution phases**:
     1. **Step 1: Setup, Handle Grip & Base Stance**
     2. **Step 2: Eccentric Lowering & Scapular Control**
     3. **Step 3: Peak Lengthened Stretch Pause (Jeff Nippard Key Hypertrophy Cue)**
     4. **Step 4: Concentric Drive & Handle Path**
     5. **Step 5: Peak Contraction & Controlled Lockout**
   - Renders an **H.264 MP4 Step-by-Step Flow Video** complete with phase title cards, 1.1-second freeze-frame biomechanical checkpoint callouts, and real-time skeletal angle HUD overlays.

---

## Repository Structure

```text
formflow-ai/
├── backend/                  # FastAPI + MediaPipe + Gemini + OpenCV/FFmpeg pipeline
│   ├── app/
│   │   ├── main.py           # REST API & background job orchestrator
│   │   ├── schemas.py        # Pydantic models for angles, handle/stance, and flow steps
│   │   └── services/
│   │       ├── pose_analyzer.py   # 33-keypoint pose tracking & joint angle trigonometry
│   │       ├── nippard_ai.py      # Jeff Nippard biomechanics presets + Gemini 2.5 Flash cues
│   │       ├── video_ingestor.py  # YouTube (yt-dlp) & video upload + synthetic studio generator
│   │       └── flow_renderer.py   # Annotated HUD keyframes & Step-by-Step Flow MP4 renderer
│   ├── tests/
│   │   └── test_pipeline.py  # End-to-end automated pipeline verification
│   ├── pyproject.toml
│   └── .env.example
└── mobile/                   # Android & Cross-Platform App (React Native + Expo Router)
    ├── app/
    │   ├── _layout.tsx       # Dark biomechanics navigation stack
    │   ├── index.tsx         # YouTube URL input, Android Share Intent listener, Video Upload & Presets
    │   └── analysis/[jobId].tsx # Step-by-Step Flow Video Player, Handle/Ankle Panel & Angle Gauges
    ├── src/
    │   ├── api/client.ts     # FastAPI client
    │   ├── components/
    │   │   ├── AngleGaugeCard.tsx
    │   │   ├── HandleAndAnklePanel.tsx
    │   │   └── StepFlowTimeline.tsx
    │   └── types/workout.ts
    ├── app.json              # Configured with Android SEND intent filters for YouTube sharing
    └── package.json
```

---

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
# Create virtual environment and install dependencies
uv venv .venv --python /opt/homebrew/bin/python3.12
source .venv/bin/activate
uv pip install -e ".[dev]"

# Optional: Add your Gemini API key for live LLM cue enrichment
cp .env.example .env

# Run the FastAPI server on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Run the Android App (Expo)

```bash
cd mobile
npm install

# Start Expo (press 'a' for Android Emulator, or scan QR code in Expo Go)
npx expo start
```

> **Note for Physical Android Devices:** Set `EXPO_PUBLIC_API_URL=http://<YOUR_MAC_LAN_IP>:8000` when starting Expo so your phone can reach the local FastAPI backend.
