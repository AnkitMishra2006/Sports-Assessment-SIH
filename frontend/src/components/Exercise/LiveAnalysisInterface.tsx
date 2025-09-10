import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Camera, 
  Settings, 
  Volume2,
  VolumeX,
  RotateCcw 
} from 'lucide-react';
import { cameraService, CameraService } from '@/services/camera';
import { LiveAnalysisSocket } from '@/services/api';
import { PoseOverlay } from './PoseOverlay';
import { MetricsDashboard } from './MetricsDashboard';
import { useToast } from '@/hooks/use-toast';

interface LiveAnalysisInterfaceProps {
  exerciseType: string;
  onComplete: (results: any) => void;
  onBack: () => void;
}

interface LiveMetrics {
  repCount: number;
  currentStage: string;
  formStatus: 'good' | 'bad' | 'neutral';
  formScore: number;
  sessionTime: number;
  averageSpeed: number;
  poseData?: any;
}

export function LiveAnalysisInterface({ exerciseType, onComplete, onBack }: LiveAnalysisInterfaceProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    repCount: 0,
    currentStage: 'Ready',
    formStatus: 'neutral',
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

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  // Session timer
  useEffect(() => {
    if (isAnalyzing && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current!) / 1000;
        setMetrics(prev => ({
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

  const initializeCamera = async () => {
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
        facingMode: 'user',
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
      console.error('Camera initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnalysis = useCallback(async () => {
    if (!stream) {
      toast({
        title: "No Camera Stream",
        description: "Please ensure camera is working before starting analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Initialize WebSocket connection for real-time analysis
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      
      socketRef.current = new LiveAnalysisSocket();
      
      socketRef.current.connect(
        newSessionId,
        (data) => {
          // Handle real-time analysis data
          if (data.type === 'metrics') {
            setMetrics(prev => ({
              ...prev,
              ...data.metrics,
            }));
            
            setProgress(data.progress || 0);
            
            // Audio feedback
            if (audioEnabled && data.feedback) {
              playAudioFeedback(data.feedback);
            }
          } else if (data.type === 'complete') {
            handleAnalysisComplete(data.results);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: "Lost connection to analysis service.",
            variant: "destructive",
          });
        }
      );

      setIsAnalyzing(true);
      startTimeRef.current = Date.now();
      
      // Start sending video frames
      startFrameCapture();
      
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to start live analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [stream, audioEnabled, toast]);

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
          console.error('Frame capture failed:', error);
        }
      }
    };

    // Capture frames at 10 FPS for analysis
    const frameInterval = setInterval(captureFrame, 100);
    
    return () => clearInterval(frameInterval);
  }, [isAnalyzing]);

  const handleAnalysisComplete = (results: any) => {
    stopAnalysis();
    onComplete({
      ...results,
      sessionTime: metrics.sessionTime,
      totalReps: metrics.repCount,
    });
  };

  const resetSession = () => {
    setMetrics({
      repCount: 0,
      currentStage: 'Ready',
      formStatus: 'neutral',
      formScore: 0,
      sessionTime: 0,
      averageSpeed: 0,
    });
    setProgress(0);
  };

  const playAudioFeedback = (feedback: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.rate = 1.2;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const cleanup = () => {
    stopAnalysis();
    if (stream) {
      cameraService.stopCamera();
      setStream(null);
    }
  };

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'bad': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {exerciseType.replace('-', ' ')} - Live Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {isAnalyzing ? 'Analyzing' : 'Ready'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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
                        Reps: <span className="text-2xl font-bold text-green-400">{metrics.repCount}</span>
                      </div>
                      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                        Stage: <span className="font-semibold">{metrics.currentStage}</span>
                      </div>
                      <div className={`${getFormStatusColor(metrics.formStatus)} text-white px-3 py-2 rounded-lg text-sm`}>
                        Form: <span className="font-semibold capitalize">{metrics.formStatus}</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm text-right">
                        <div>Time: {Math.floor(metrics.sessionTime)}s</div>
                        <div>Speed: {metrics.averageSpeed.toFixed(1)}/min</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <Progress value={progress} className="w-full h-2 bg-black/50" />
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