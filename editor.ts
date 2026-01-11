export type MediaFile = {
  id: string;
  name: string;
  type: "video" | "audio";
  duration: number;
  url: string;
};

export type Clip = {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number;
  endTime: number;

  playbackRate?: number;
  opacity?: number;
  muted?: boolean;

  thumbnails?: string[]; 
};



export type Track = {
  id: string;
  type: "video" | "audio";
  
};


