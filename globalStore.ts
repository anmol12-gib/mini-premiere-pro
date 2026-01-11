          import { create } from "zustand";
import type { MediaFile, Clip, Track } from "../types/editor";

type EditorState = {
  /* ======================
     DATA
     ====================== */
  mediaFiles: MediaFile[];
  clips: Clip[];
  tracks: Track[];

  /* ======================
     PLAYBACK
     ====================== */
  currentTime: number;
  duration: number;
  zoomLevel: number;
  isPlaying: boolean;

  /* ======================
     INTERNAL
     ====================== */
  _rafId: number | null;

  /* ======================
     SELECTION / DRAG
     ====================== */
  selectedClipId: string | null;
  draggingClipId: string | null;

  /* ======================
     ACTIONS
     ====================== */
  setCurrentTime: (t: number) => void;
  setZoomLevel: (z: number) => void;

  play: () => void;
  pause: () => void;

  addMedia: (m: MediaFile) => void;
  addClip: (c: Clip) => void;

  selectClip: (id: string | null) => void;

  updateClipProps: (
    id: string,
    props: Partial<Clip>
  ) => void;

  deleteClip: (id: string) => void;
  duplicateClip: (id: string) => void;
  splitClipAtTime: (time: number) => void;
  toggleClipMute: (id: string) => void;

  startDragging: (id: string) => void;
  endDragging: () => void;
  moveClipToTrack: (
    id: string,
    trackId: string,
    startTime: number
  ) => void;
};

export const useGlobalStore = create<EditorState>((set, get) => ({
  /* ======================
     INITIAL STATE
     ====================== */
  mediaFiles: [],
  clips: [],
  tracks: [],

  currentTime: 0,
  duration: 0,
  zoomLevel: 1,
  isPlaying: false,
  _rafId: null,

  selectedClipId: null,
  draggingClipId: null,

  /* ======================
     BASIC SETTERS
     ====================== */
  setCurrentTime: (t) =>
    set((s) => ({
      currentTime: Math.max(
        0,
        Math.min(t, s.duration)
      ),
    })),

  setZoomLevel: (z) =>
    set({
      zoomLevel: Math.max(0.25, Math.min(z, 4)),
    }),

  /* ======================
     PLAYBACK ENGINE
     ====================== */
  play: () => {
    if (get().isPlaying) return;

    let last = performance.now();

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      const { currentTime, duration } = get();
      const next = currentTime + delta;

      if (next >= duration) {
        set({
          currentTime: duration,
          isPlaying: false,
          _rafId: null,
        });
        return;
      }

      set({ currentTime: next });
      const id = requestAnimationFrame(tick);
      set({ _rafId: id });
    };

    set({ isPlaying: true });
    const id = requestAnimationFrame(tick);
    set({ _rafId: id });
  },

  pause: () => {
    const id = get()._rafId;
    if (id) cancelAnimationFrame(id);
    set({ isPlaying: false, _rafId: null });
  },

  /* ======================
     MEDIA
     ====================== */
  addMedia: (m) =>
    set((s) => ({
      mediaFiles: [...s.mediaFiles, m],
    })),

  /* ======================
     CLIP + TRACK CREATION
     ====================== */
  addClip: (clip) =>
  set((state) => {
    // 1️⃣ Find GLOBAL last end time (across ALL tracks)
    const lastEndTime =
      state.clips.length === 0
        ? 0
        : Math.max(...state.clips.map(c => c.endTime));

    // 2️⃣ Duration of incoming clip
    const clipDuration = clip.endTime - clip.startTime;

    // 3️⃣ Create NEW track for every new video
    const trackId = `track-${state.tracks.length + 1}`;

    const newTrack: Track = {
      id: trackId,
      type: "video",
    };

    // 4️⃣ Place clip AFTER previous clip ends
    const newClip: Clip = {
      ...clip,
      trackId,
      startTime: lastEndTime,
      endTime: lastEndTime + clipDuration,
    };

    return {
      tracks: [...state.tracks, newTrack],
      clips: [...state.clips, newClip],
      duration: Math.max(state.duration, newClip.endTime),
    };
  }),



  /* ======================
     SELECTION / DRAG
     ====================== */
  selectClip: (id) => set({ selectedClipId: id }),

  startDragging: (id) =>
    set({ draggingClipId: id }),

  endDragging: () =>
    set({ draggingClipId: null }),

  /* ======================
     UPDATE + RIPPLE
     ====================== */
  updateClipProps: (id, props) =>
    set((s) => {
      const target = s.clips.find(
        (c) => c.id === id
      );
      if (!target) return s;

      const originalEnd = target.endTime;

      const updated = s.clips.map((clip) => {
        if (clip.id === id) {
          return { ...clip, ...props };
        }

        if (
          clip.trackId === target.trackId &&
          clip.startTime >= originalEnd &&
          props.endTime !== undefined
        ) {
          const delta =
            props.endTime - originalEnd;
          return {
            ...clip,
            startTime: clip.startTime + delta,
            endTime: clip.endTime + delta,
          };
        }

        return clip;
      });

      return {
        clips: updated,
        duration: Math.max(
          ...updated.map((c) => c.endTime)
        ),
      };
    }),

  /* ======================
     DELETE / DUPLICATE
     ====================== */
  deleteClip: (id) =>
    set((s) => {
      const clips = s.clips.filter(
        (c) => c.id !== id
      );
      return {
        clips,
        duration:
          clips.length === 0
            ? 0
            : Math.max(...clips.map((c) => c.endTime)),
      };
    }),

  duplicateClip: (id) =>
    set((s) => {
      const clip = s.clips.find(
        (c) => c.id === id
      );
      if (!clip) return s;

      const duration =
        clip.endTime - clip.startTime;

      const newClip: Clip = {
        ...clip,
        id: crypto.randomUUID(),
        startTime: clip.endTime,
        endTime: clip.endTime + duration,
      };

      const clips = [...s.clips, newClip];

      return {
        clips,
        duration: Math.max(...clips.map((c) => c.endTime)),
      };
    }),

  /* ======================
     SPLIT (SAME TRACK)
     ====================== */
  splitClipAtTime: (time) =>
    set((s) => {
      const result: Clip[] = [];

      s.clips.forEach((clip) => {
        if (
          time > clip.startTime &&
          time < clip.endTime
        ) {
          result.push(
            {
              ...clip,
              id: crypto.randomUUID(),
              endTime: time,
            },
            {
              ...clip,
              id: crypto.randomUUID(),
              startTime: time,
            }
          );
        } else {
          result.push(clip);
        }
      });

      return {
        clips: result,
        duration: Math.max(
          ...result.map((c) => c.endTime)
        ),
      };
    }),

  /* ======================
     MUTE
     ====================== */
  toggleClipMute: (id) =>
    set((s) => ({
      clips: s.clips.map((c) =>
        c.id === id
          ? { ...c, muted: !c.muted }
          : c
      ),
    })),

  /* ======================
     MOVE (FOUNDATION)
     ====================== */
  moveClipToTrack: (
    id,
    trackId,
    startTime
  ) =>
    set((s) => {
      const clip = s.clips.find(
        (c) => c.id === id
      );
      if (!clip) return s;

      const duration =
        clip.endTime - clip.startTime;

      const updated = s.clips.map((c) =>
        c.id === id
          ? {
              ...c,
              trackId,
              startTime,
              endTime: startTime + duration,
            }
          : c
      );

      

      return {
        clips: updated,
        duration: Math.max(
          ...updated.map((c) => c.endTime)
        ),
      };
    }),
}));
 