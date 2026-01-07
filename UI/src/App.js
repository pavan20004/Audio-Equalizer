import "./App.css";
import { useState } from "react";
import useAudioStream from "./hooks/useAudioStream";
import CircularEqualizer from "./components/CircularEqualizer";

function App() {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const { startStreaming, socket } = useAudioStream();

  const start = async () => {
    try {
      setStatus("listening");
      const micStream = await startStreaming((text) => {
        setTranscript(text);
      });
      setStream(micStream);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Live Audio Analyzer</h1>
        <p className="subtitle">
          Real-time audio visualization & transcription
        </p>
      </header>

      <div className="card">
        <p
          className={`status ${
            status === "listening"
              ? "status-live"
              : status === "error"
              ? "status-error"
              : ""
          }`}
        >
          {status === "idle" && "Click to start listening"}
          {status === "listening" && "Listening…"}
          {status === "error" && "Microphone error"}
        </p>

        <div className="visual">
          {stream ? (
            <CircularEqualizer stream={stream} />
          ) : (
            <button onClick={start} className="start-btn">
              🎙 Start Microphone
            </button>
          )}
        </div>

        <div className="transcript">{transcript || "Waiting for speech…"}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
  },
  status: {
    fontSize: 14,
  },
  visual: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    padding: "12px 24px",
    fontSize: 16,
    borderRadius: 999,
    background: "#22c55e",
    border: "none",
    cursor: "pointer",
    color: "#000",
  },
  transcript: {
    maxWidth: 420,
    padding: 12,
    background: "#020617",
    borderRadius: 8,
    fontSize: 14,
    textAlign: "center",
  },
};

export default App;
