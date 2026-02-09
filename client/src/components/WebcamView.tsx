import React, { useRef, useEffect, forwardRef } from "react";

interface WebcamViewProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  className?: string;
  overlay?: React.ReactNode;
}

export const WebcamView = forwardRef<HTMLVideoElement, WebcamViewProps>(
  ({ onVideoReady, className, overlay }, ref) => {
    const localRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || localRef;

    useEffect(() => {
      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 1280, 
              height: 720,
              facingMode: "user" 
            } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              onVideoReady?.(videoRef.current!);
            };
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
        }
      };

      startVideo();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }, [onVideoReady]);

    return (
      <div className={`relative overflow-hidden rounded-lg border border-primary/30 bg-black/50 ${className}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          muted
          autoPlay
          playsInline
        />
        
        {/* HUD Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
          
          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-primary/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-primary rounded-full" />
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-xs font-mono text-primary animate-pulse">
            REC ● LIVE
          </div>
        </div>
        
        {overlay}
      </div>
    );
  }
);

WebcamView.displayName = "WebcamView";
