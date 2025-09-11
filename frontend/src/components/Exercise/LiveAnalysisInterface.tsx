import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  Camera,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Upload,
  Video,
  ArrowLeft,
} from "lucide-react";
import { cameraService, CameraService } from "@/services/camera";
import { LiveAnalysisSocket, analysisAPI } from "@/services/api";
import { PoseOverlay } from "./PoseOverlay";
import { MetricsDashboard } from "./MetricsDashboard";
import { VideoUploadInterface } from "./VideoUploadInterface";
import { useToast } from "@/hooks/use-toast";

// Type definitions for analysis results
interface AnalysisResults {
  submissionId: string;
  exerciseType: string;
  metrics: {
    repCount: number;
    formScore: number;
    averageSpeed: number;
    sessionTime: number;
  };
  analysis: {
    strengths: string[];
    improvements: string[];
    overallScore: number;
    recommendations: string[];
  };
}

// Type for pose detection data
interface PoseData {
  keypoints: Array<{
    x: number;
    y: number;
    confidence: number;
  }>;
  connections: number[][];
  timestamp?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface LiveAnalysisInterfaceProps {
  exerciseType: string;
  onComplete: (results: AnalysisResults) => void;
  onBack: () => void;
}

type AnalysisMode = "selection" | "live" | "upload";

interface LiveMetrics {
  repCount: number;
  currentStage: string;
  formStatus: "good" | "bad" | "neutral";
  formScore: number;
  sessionTime: number;
  averageSpeed: number;
  poseData?: PoseData;
}

export function LiveAnalysisInterface({
  exerciseType,
  onComplete,
  onBack,
}: LiveAnalysisInterfaceProps) {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("selection");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    repCount: 0,
    currentStage: "Ready",
    formStatus: "neutral",
    formScore: 0,
    sessionTime: 0,
    averageSpeed: 0,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<LiveAnalysisSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { toast } = useToast();

  // Session timer
  useEffect(() => {
    if (isAnalyzing && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current!) / 1000;
        setMetrics((prev) => ({
          ...prev,
          sessionTime: elapsed,
          averageSpeed: prev.repCount > 0 ? (prev.repCount / elapsed) * 60 : 0,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnalyzing]);

  const initializeCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      const hasPermission = await CameraService.checkCameraPermission();

      if (!hasPermission) {
        toast({
          title: "Camera Permission Required",
          description: "Please allow camera access to use live analysis.",
          variant: "destructive",
        });
        return;
      }

      const mediaStream = await cameraService.startCamera({
        width: 1280,
        height: 720,
        facingMode: "user",
        frameRate: 30,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions.",
        variant: "destructive",
      });
      console.error("Camera initialization failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Helper function for local pose detection (simplified for MVP)
  const startLocalPoseDetection = useCallback(() => {
    // This would integrate with MediaPipe or similar library
    // For now, we'll simulate progress updates
    let repCount = 0;
    const simulateReps = setInterval(() => {
      if (!isAnalyzing) {
        clearInterval(simulateReps);
        return;
      }

      // Simulate rep detection every 3-5 seconds
      if (Math.random() > 0.7) {
        repCount++;
        setMetrics((prev) => ({
          ...prev,
          repCount,
          currentStage: repCount % 2 === 0 ? "Down" : "Up",
          formStatus: Math.random() > 0.8 ? "bad" : "good",
          confidence: 0.85 + Math.random() * 0.1,
        }));

        // Update progress (example: target of 10 reps)
        setProgress(Math.min((repCount / 10) * 100, 100));
      }
    }, 3000);

    // Clean up on component unmount or analysis stop
    return () => clearInterval(simulateReps);
  }, [isAnalyzing]);

  const startAnalysis = useCallback(async () => {
    if (!stream) {
      toast({
        title: "No Camera Stream",
        description:
          "Please ensure camera is working before starting analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Start live analysis session with backend
      const response = await analysisAPI.startLiveAnalysis(exerciseType);

      if (!response.success) {
        throw new Error(response.message || "Failed to start analysis session");
      }

      setSessionId(response.sessionId);
      setIsAnalyzing(true);
      startTimeRef.current = Date.now();

      // Initialize metrics for the specific exercise
      const initialMetrics = getInitialMetrics(exerciseType);
      setMetrics(initialMetrics);

      toast({
        title: "Analysis Started",
        description: `Live ${exerciseType.replace(
          "-",
          " "
        )} analysis is now active.`,
      });

      // For MVP, we'll use local pose detection instead of WebSocket
      // This simulates the real-time analysis that would come from the backend
      startLocalPoseDetection();
    } catch (error) {
      console.error("Failed to start analysis:", error);
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not start live analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [stream, exerciseType, toast, startLocalPoseDetection]);

  // Helper function to get initial metrics based on exercise type
  const getInitialMetrics = (exerciseType: string) => {
    const baseMetrics = {
      repCount: 0,
      currentStage: "Ready",
      formStatus: "neutral" as "good" | "bad" | "neutral",
      sessionTime: 0,
      averageSpeed: 0,
      formScore: 100,
      confidence: 0,
    };

    switch (exerciseType) {
      case "bicep-curls":
        return { ...baseMetrics, leftReps: 0, rightReps: 0 };
      case "vertical-jump":
        return { ...baseMetrics, maxHeight: 0, jumpCount: 0 };
      default:
        return baseMetrics;
    }
  };

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress(0);
    startTimeRef.current = null;
  }, []);

  const startFrameCapture = useCallback(() => {
    if (!videoRef.current || !socketRef.current) return;

    const captureFrame = () => {
      if (isAnalyzing && videoRef.current && socketRef.current) {
        try {
          const frameData = cameraService.captureFrame(videoRef.current);
          socketRef.current.sendFrame(frameData);
        } catch (error) {
          console.error("Frame capture failed:", error);
        }
      }
    };

    // Capture frames at 10 FPS for analysis
    const frameInterval = setInterval(captureFrame, 100);

    return () => clearInterval(frameInterval);
  }, [isAnalyzing]);

  const handleAnalysisComplete = (results: AnalysisResults) => {
    stopAnalysis();
    onComplete({
      ...results,
      metrics: {
        ...results.metrics,
        sessionTime: metrics.sessionTime,
        repCount: metrics.repCount,
      },
    });
  };

  const resetSession = () => {
    setMetrics({
      repCount: 0,
      currentStage: "Ready",
      formStatus: "neutral",
      formScore: 0,
      sessionTime: 0,
      averageSpeed: 0,
    });
    setProgress(0);
  };

  const playAudioFeedback = (feedback: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.rate = 1.2;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const cleanup = useCallback(() => {
    stopAnalysis();
    if (stream) {
      cameraService.stopCamera();
      setStream(null);
    }
  }, [stream, stopAnalysis]);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [initializeCamera, cleanup]);

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "bad":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  // Selection screen for choosing analysis mode
  const renderModeSelection = () => (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize flex items-center gap-2">
              <Video className="h-5 w-5" />
              {exerciseType.replace("-", " ")} - Choose Analysis Method
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Analysis Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
              <CardContent
                className="p-6"
                onClick={() => setAnalysisMode("live")}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Live Analysis
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Perform the exercise in front of your camera and get
                      real-time feedback
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div>✓ Real-time form correction</div>
                      <div>✓ Live rep counting</div>
                      <div>✓ Instant feedback</div>
                    </div>
                  </div>
                  <Button className="w-full">Start Live Analysis</Button>
                </div>
              </CardContent>
            </Card>

            {/* Video Upload Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500">
              <CardContent
                className="p-6"
                onClick={() => setAnalysisMode("upload")}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upload Video</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Upload a pre-recorded video of your exercise for analysis
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div>✓ Detailed analysis report</div>
                      <div>✓ AI-powered insights</div>
                      <div>✓ Perfect for MVP demo</div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Upload Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Handle different analysis modes
  if (analysisMode === "selection") {
    return renderModeSelection();
  }

  if (analysisMode === "upload") {
    return (
      <VideoUploadInterface
        exerciseType={exerciseType}
        onComplete={onComplete}
        onBack={() => setAnalysisMode("selection")}
      />
    );
  }

  // Live analysis mode (existing code)
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {exerciseType.replace("-", " ")} - Live Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {isAnalyzing ? "Analyzing" : "Ready"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnalysisMode("selection")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Pose Overlay */}
                {isAnalyzing && metrics.poseData && (
                  <PoseOverlay
                    poseData={metrics.poseData}
                    videoWidth={1280}
                    videoHeight={720}
                  />
                )}

                {/* Real-time Metrics Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 space-y-2">
                      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-mono">
                        Reps:{" "}
                        <span className="text-2xl font-bold text-green-400">
                          {metrics.repCount}
                        </span>
                      </div>
                      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                        Stage:{" "}
                        <span className="font-semibold">
                          {metrics.currentStage}
                        </span>
                      </div>
                      <div
                        className={`${getFormStatusColor(
                          metrics.formStatus
                        )} text-white px-3 py-2 rounded-lg text-sm`}
                      >
                        Form:{" "}
                        <span className="font-semibold capitalize">
                          {metrics.formStatus}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm text-right">
                        <div>Time: {Math.floor(metrics.sessionTime)}s</div>
                        <div>Speed: {metrics.averageSpeed.toFixed(1)}/min</div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <Progress
                        value={progress}
                        className="w-full h-2 bg-black/50"
                      />
                      <p className="text-white text-sm mt-2 text-center">
                        Session Progress: {progress.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {!isAnalyzing ? (
                  <Button
                    onClick={startAnalysis}
                    disabled={!stream || isLoading}
                    className="flex-1 h-12"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Analysis
                  </Button>
                ) : (
                  <Button
                    onClick={stopAnalysis}
                    variant="destructive"
                    className="flex-1 h-12"
                    size="lg"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop Analysis
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={resetSession}
                  disabled={isAnalyzing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>

                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="lg:col-span-1">
              <MetricsDashboard
                metrics={metrics}
                exerciseType={exerciseType}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
