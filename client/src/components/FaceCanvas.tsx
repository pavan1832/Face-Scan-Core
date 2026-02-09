import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

interface FaceCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faces: faceapi.FaceDetection[];
  matches?: { detection: faceapi.FaceDetection; label: string; distance: number }[];
}

export function FaceCanvas({ videoRef, faces, matches }: FaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas size to video size
    const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
    
    if (displaySize.width === 0 || displaySize.height === 0) return;

    faceapi.matchDimensions(canvas, displaySize);

    // Resize detections
    const resizedDetections = faceapi.resizeResults(faces, displaySize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((detection, i) => {
      const box = detection.box;
      const match = matches ? matches[i] : null;

      // Draw futuristic brackets instead of simple box
      const color = match && match.label !== "unknown" ? "#00ffff" : "#ff0055";
      const label = match ? `${match.label} (${Math.round((1 - match.distance) * 100)}%)` : "Detecting...";

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      // Draw corners
      const len = 20;
      
      // Top Left
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + len);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + len, box.y);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - len, box.y);
      ctx.lineTo(box.x + box.width, box.y);
      ctx.lineTo(box.x + box.width, box.y + len);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(box.x + box.width, box.y + box.height - len);
      ctx.lineTo(box.x + box.width, box.y + box.height);
      ctx.lineTo(box.x + box.width - len, box.y + box.height);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(box.x + len, box.y + box.height);
      ctx.lineTo(box.x, box.y + box.height);
      ctx.lineTo(box.x, box.y + box.height - len);
      ctx.stroke();

      // Draw Label Background
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(box.x, box.y - 30, box.width, 30);
      
      // Draw Label Text
      ctx.globalAlpha = 1.0;
      ctx.font = "16px Share Tech Mono";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label.toUpperCase(), box.x + 10, box.y - 10);
      
      // Scanning line inside the box
      const time = Date.now() / 1000;
      const scanY = box.y + (Math.sin(time * 2) * 0.5 + 0.5) * box.height;
      
      ctx.beginPath();
      ctx.moveTo(box.x, scanY);
      ctx.lineTo(box.x + box.width, scanY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

  }, [videoRef, faces, matches]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
