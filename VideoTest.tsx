export function VideoTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <video
        src="/aisa.mp4"
        controls
        autoPlay
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
