import { useEffect, useRef } from "react";

export default function useAudioStream() {
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080/ws/audio");
    socketRef.current.binaryType = "arraybuffer";

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => socketRef.current?.close();
  }, []);

  const startStreaming = async (onTranscript) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    // SEND AUDIO → BACKEND
    mediaRecorderRef.current.ondataavailable = async (e) => {
      if (e.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        const buffer = await e.data.arrayBuffer();
        socketRef.current.send(buffer);
      }
    };

    // RECEIVE TRANSCRIPT ← BACKEND
    socketRef.current.onmessage = (e) => {
      onTranscript(e.data);
    };

    mediaRecorderRef.current.start(30); // 30ms chunks
    return stream;
  };

  return { startStreaming };
}
