import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, CheckCircle, AlertTriangle, Play, Pause } from 'lucide-react';
import type { ExerciseType, AnalysisMode } from './ExerciseSelector';

interface AnalysisInterfaceProps {
  exercise: ExerciseType;
  mode: AnalysisMode;
  onComplete: (results: AnalysisResults) => void;
  onBack: () => void;
}

export interface AnalysisResults {
  exercise: ExerciseType;
  totalReps: number;
  formQuality: number;
  cheatingDetected: boolean;
  averageSpeed: number;
  duration: number;
  stages: string[];
}

export function AnalysisInterface({ exercise, mode, onComplete, onBack }: AnalysisInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [currentStage, setCurrentStage] = useState('Ready');
  const [formStatus, setFormStatus] = useState<'good' | 'bad' | 'neutral'>('neutral');
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'live' && isActive) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, isActive]);

  useEffect(() => {
    if (isActive && mode === 'live') {
      const interval = setInterval(() => {
        // Simulate exercise detection
        const stages = getExerciseStages(exercise);
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        setCurrentStage(randomStage);
        
        // Simulate form analysis
        const formStates: ('good' | 'bad' | 'neutral')[] = ['good', 'good', 'good', 'bad', 'neutral'];
        setFormStatus(formStates[Math.floor(Math.random() * formStates.length)]);
        
        // Simulate rep counting (random chance to increment)
        if (Math.random() > 0.7 && currentStage === 'Down') {
          setRepCount(prev => prev + 1);
        }
        
        setProgress(prev => Math.min(prev + 1, 100));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, exercise, currentStage, mode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const getExerciseStages = (exercise: ExerciseType): string[] => {
    switch (exercise) {
      case 'bicep-curls':
        return ['Ready', 'Up', 'Hold', 'Down'];
      case 'sit-ups':
        return ['Ready', 'Up', 'Hold', 'Down'];
      case 'vertical-jump':
        return ['Ready', 'Crouch', 'Jump', 'Land'];
      default:
        return ['Ready', 'Active', 'Rest'];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        simulateAnalysis();
      }, 3000);
    }
  };

  const simulateAnalysis = () => {
    const results: AnalysisResults = {
      exercise,
      totalReps: Math.floor(Math.random() * 25) + 5,
      formQuality: Math.floor(Math.random() * 30) + 70,
      cheatingDetected: Math.random() > 0.8,
      averageSpeed: Math.random() * 2 + 1,
      duration: Math.floor(Math.random() * 60) + 30,
      stages: getExerciseStages(exercise),
    };
    onComplete(results);
  };

  const handleStartStop = () => {
    if (mode === 'live') {
      setIsActive(!isActive);
      if (!isActive) {
        setRepCount(0);
        setProgress(0);
        setCurrentStage('Ready');
      } else if (progress >= 100) {
        simulateAnalysis();
      }
    }
  };

  const getFormStatusColor = () => {
    switch (formStatus) {
      case 'good': return 'bg-green-500';
      case 'bad': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFormStatusIcon = () => {
    switch (formStatus) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'bad': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{exercise.replace('-', ' ')} Analysis</CardTitle>
            <Badge variant="outline" className="capitalize">
              {mode === 'live' ? <Camera className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
              {mode} Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'live' ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-black/20">
                    <div className="absolute top-4 left-4 space-y-2">
                      <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        Reps: {repCount}
                      </div>
                      <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        Stage: {currentStage}
                      </div>
                      <div className={`${getFormStatusColor()} text-white px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
                        {getFormStatusIcon()}
                        Form: {formStatus}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-white text-sm mt-2">Analysis Progress: {progress}%</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleStartStop} className="flex-1">
                  {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isActive ? 'Pause' : 'Start'} Analysis
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {!uploadedFile ? (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Upload Exercise Video</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a video file to analyze your {exercise.replace('-', ' ')} performance
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <video
                      src={URL.createObjectURL(uploadedFile)}
                      controls
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <p className="mt-4 font-medium">{uploadedFile.name}</p>
                    {isProcessing && (
                      <div className="mt-4">
                        <Progress value={66} className="w-full max-w-md mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Analyzing video... This may take a moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {uploadedFile ? 'Choose Different File' : 'Select Video'}
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}