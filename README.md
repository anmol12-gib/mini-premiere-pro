#MINI-PREMIERE-PRO

Mini Premiere Pro is a **browser-based video editing application** inspired by professional tools like Adobe Premiere Pro.  
It provides a **multi-track timeline**, **real-time preview**, **clip inspector**, and **export/share capabilities**, all built using modern web technologies.

This project is currently **local-first** and is architected to **scale into a cloud-based video editor** in future versions.

---

##  Features

###  Timeline Editing
- Multi-track timeline
- Drag, move, trim, split, duplicate clips
- Magnetic snapping (playhead & clip edges)
- Ripple editing within tracks
- Playhead auto-stop on gaps
- Timeline zoom support

### Preview Canvas
- Real-time video preview
- 9:16 vertical aspect ratio support
- Play / Pause with accurate seeking
- Gaps between clips show black screen

###  Clip Inspector
- Start time & end time controls
- Playback speed control (0.25x → 2x)
- Opacity adjustment
- Per-clip mute

###  Media Management
- Import local video files
- Media library panel
- Auto placement of new clips after previous clips
- Each video added to a new track by default

###  Share & Export
- **Download MP4** (full timeline render)
- **Public View Link** (watch-only browser playback)
- Export system designed to support cloud rendering later

---

## Tech Stack

| Layer | Technology |
|-----|------------|
| Frontend | React + TypeScript (Vite) |
| State Management | Zustand |
| Styling | Bootstrap 5 + Custom CSS |
| Video Handling | HTML5 Video |
| Architecture | Frontend-first, backend-ready |

---

## Architecture Highlights

- Timeline is **data-driven**
- Editor state is centralized using Zustand
- Rendering logic is decoupled from UI
- Designed for **future FFmpeg-based rendering**
- Scalable from local → cloud-based editor

---

## Project Structure
src/ ├── components/ │   ├── Timeline/ │   ├── PreviewCanvas/ │   ├── InspectorPanel/ │   ├── MediaPanel/ │   └── TopBar/ ├── layout/ │   └── EditorLayout.tsx ├── store/ │   └── globalStore.ts ├── utils/ │   ├── thumbnails.ts │   ├── snap.ts │   └── time.ts ├── styles/ │   └── editor.css └── main.tsx
Copy code

---


This project is licensed under the MIT License.
