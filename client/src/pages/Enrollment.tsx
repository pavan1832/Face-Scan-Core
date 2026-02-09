import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useCreateUser } from "@/hooks/use-users";
import { WebcamView } from "@/components/WebcamView";
import { CyberButton } from "@/components/CyberButton";
import { FaceCanvas } from "@/components/FaceCanvas";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, RefreshCw, Camera } from "lucide-react";

export default function Enrollment() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState<faceapi.FaceDetection[]>([]);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  const [name, setName] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mutate: createUser, isPending } = useCreateUser();
  const { toast } = useToast();

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
        toast({
          title: "System Error",
          description: "Failed to load neural network models.",
          variant: "destructive",
        });
      }
    };
    loadModels();
  }, [toast]);

  const detectFace = async () => {
    if (!videoRef.current || !modelLoaded) return;
    
    setDetecting(true);
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setDetections([detection.detection]);
      setDescriptor(detection.descriptor);
      toast({
        title: "Subject Scanned",
        description: "Face descriptor extracted successfully.",
      });
    } else {
      setDetections([]);
      setDescriptor(null);
      toast({
        title: "Scan Failed",
        description: "No face detected. Please face the camera directly.",
        variant: "destructive",
      });
    }
    setDetecting(false);
  };

  const handleEnroll = () => {
    if (!descriptor || !name) return;
    
    // Convert Float32Array to regular array for JSON serialization
    const descriptorArray = Array.from(descriptor);
    
    createUser(
      { name, faceDescriptor: descriptorArray },
      {
        onSuccess: () => {
          toast({
            title: "Enrollment Complete",
            description: `Subject ${name} has been added to the database.`,
            variant: "default",
          });
          setName("");
          setDescriptor(null);
          setDetections([]);
        },
        onError: (err) => {
          toast({
            title: "Enrollment Failed",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full max-w-6xl mx-auto">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Identity Enrollment</h1>
          {!modelLoaded && (
            <span className="flex items-center gap-2 text-yellow-500 font-mono text-sm animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              LOADING NEURAL NETWORKS...
            </span>
          )}
        </div>

        <div className="relative rounded-xl border border-primary/20 bg-card p-1 shadow-2xl">
          <WebcamView 
            ref={videoRef} 
            className="aspect-video w-full rounded-lg"
            overlay={
              <FaceCanvas 
                videoRef={videoRef} 
                faces={detections}
              />
            }
          />
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-primary" />
            <h2 className="text-xl">Subject Data</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground font-mono">FULL IDENTIFIER</Label>
              <Input
                id="name"
                placeholder="ENTER NAME..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-mono bg-black/40 border-primary/30 focus:border-primary text-primary placeholder:text-primary/20"
              />
            </div>

            <div className="space-y-4">
              <CyberButton 
                onClick={detectFace}
                disabled={!modelLoaded || detecting}
                variant="outline"
                className="w-full"
              >
                <Camera className="w-4 h-4" />
                {detecting ? "SCANNING..." : "SCAN FACE"}
              </CyberButton>

              <div className="p-4 rounded border border-dashed border-muted-foreground/30 bg-black/20">
                <div className="flex justify-between items-center text-xs font-mono text-muted-foreground mb-2">
                  <span>BIOMETRIC STATUS</span>
                  <span className={descriptor ? "text-primary" : "text-destructive"}>
                    {descriptor ? "CAPTURED" : "PENDING"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${descriptor ? "bg-primary w-full" : "bg-destructive w-[5%]"}`} 
                  />
                </div>
              </div>

              <CyberButton 
                onClick={handleEnroll}
                disabled={!descriptor || !name || isPending}
                className="w-full"
                variant="primary"
                isLoading={isPending}
              >
                ENROLL SUBJECT
              </CyberButton>
            </div>
          </div>
        </Card>

        <div className="p-4 border border-primary/10 rounded-lg bg-primary/5 text-xs font-mono text-primary/70">
          <p className="mb-2">INSTRUCTIONS:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Position subject in center of frame.</li>
            <li>Ensure lighting is adequate.</li>
            <li>Click SCAN FACE to capture biometrics.</li>
            <li>Enter identifier and ENROLL.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
