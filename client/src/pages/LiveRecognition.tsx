import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useUsers } from "@/hooks/use-users";
import { WebcamView } from "@/components/WebcamView";
import { FaceCanvas } from "@/components/FaceCanvas";
import { ScanFace, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LiveRecognition() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [detections, setDetections] = useState<faceapi.FaceDetection[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
      }
    };
    loadModels();
  }, []);

  // Initialize FaceMatcher when users change
  useEffect(() => {
    if (users && users.length > 0) {
      const labeledDescriptors = users.map(user => {
        // Parse the stored descriptor (which is a regular array) back to Float32Array
        const descriptorArray = user.faceDescriptor as unknown as number[];
        const float32Descriptor = new Float32Array(descriptorArray);
        return new faceapi.LabeledFaceDescriptors(user.name, [float32Descriptor]);
      });
      faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    }
  }, [users]);

  // Recognition Loop
  useEffect(() => {
    if (!modelLoaded || isLoadingUsers) return;

    let intervalId: NodeJS.Timeout;

    const startDetection = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const results = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (results.length > 0) {
          setDetections(results.map(r => r.detection));
          
          if (faceMatcherRef.current) {
            const currentMatches = results.map(res => 
              faceMatcherRef.current!.findBestMatch(res.descriptor)
            ).map((match, i) => ({
              detection: results[i].detection,
              label: match.label,
              distance: match.distance
            }));
            setMatches(currentMatches);
          } else {
            // No users in DB yet
            setMatches(results.map((res, i) => ({
              detection: res.detection,
              label: "unknown",
              distance: 1
            })));
          }
        } else {
          setDetections([]);
          setMatches([]);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    };

    intervalId = setInterval(startDetection, 100); // 10 FPS

    return () => clearInterval(intervalId);
  }, [modelLoaded, isLoadingUsers]);


  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl flex items-center gap-3">
          <ScanFace className="w-8 h-8 text-primary" />
          Live Surveillance Feed
        </h1>
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-black border border-primary/30 text-primary">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            SYSTEM ACTIVE
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-black border border-border text-muted-foreground">
            DATABASE: {users?.length || 0} SUBJECTS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative rounded-xl border border-primary/20 bg-card p-1 shadow-2xl overflow-hidden group">
             {/* Scan line effect overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
            
            <WebcamView 
              ref={videoRef} 
              className="aspect-video w-full rounded-lg"
              overlay={
                <FaceCanvas 
                  videoRef={videoRef} 
                  faces={detections}
                  matches={matches}
                />
              }
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Detection Log
          </h3>
          
          <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {matches.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-mono text-xs border border-dashed border-border rounded">
                NO ACTIVE SUBJECTS
              </div>
            ) : (
              matches.map((match, idx) => (
                <Card key={idx} className={`p-3 border-l-4 bg-black/40 backdrop-blur-sm ${
                  match.label === "unknown" ? "border-l-destructive" : "border-l-primary"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg font-display tracking-wide">
                        {match.label === "unknown" ? "UNKNOWN SUBJECT" : match.label}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        CONFIDENCE: {Math.round((1 - match.distance) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${match.label === "unknown" ? "bg-destructive" : "bg-primary"}`} 
                      style={{ width: `${(1 - match.distance) * 100}%` }}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
