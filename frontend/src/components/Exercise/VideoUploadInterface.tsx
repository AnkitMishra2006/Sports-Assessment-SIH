import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  X,
  FileVideo,
} from "lucide-react";
import { analysisAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Types for video analysis
interface VideoAnalysisResults {
  submissionId: string;
  exerciseType: string;
  metrics: {
    repCount: number;
    formScore: number;
    averageSpeed?: number;
    sessionTime: number;
    maxHeight?: number;
    consistencyScore?: number;
    formIssues?: string[];
    overallScore?: number;
  };
  analysis: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    overallScore: number;
  };
  videoUrl?: string;
  // Legacy compatibility
  exercise?: string;
  results?: unknown;
  totalReps?: number;
  maxHeight?: number;
  formQuality?: number;
  consistencyScore?: number;
  cheatingDetected?: boolean;
  formIssues?: string[];
  framesProcessed?: number;
  detectionQuality?: number;
  leftReps?: number;
  rightReps?: number;
  submission?: unknown;
}

interface VideoUploadInterfaceProps {
  exerciseType: string;
  onComplete: (results: VideoAnalysisResults) => void;
  onBack: () => void;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  error?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FORMATS = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export function VideoUploadInterface({
  exerciseType,
  onComplete,
  onBack,
}: VideoUploadInterfaceProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: "idle",
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return "Please select a valid video file (MP4, WebM, MOV, or AVI)";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setUploadState({
          file: null,
          progress: 0,
          status: "error",
          error: validationError,
        });
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      setUploadState({
        file,
        progress: 0,
        status: "idle",
      });

      // Create video preview
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);

      // Clean up previous URL
      return () => {
        if (videoPreview) {
          URL.revokeObjectURL(videoPreview);
        }
      };
    },
    [videoPreview, toast]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];

      if (file) {
        // Simulate file input change
        const fakeEvent = {
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const uploadVideo = async () => {
    if (!uploadState.file) return;

    try {
      setUploadState((prev) => ({ ...prev, status: "uploading", progress: 0 }));

      toast({
        title: "Starting Upload",
        description: `Uploading ${exerciseType.replace(
          "-",
          " "
        )} video for analysis...`,
      });

      // Upload with progress tracking
      const uploadResponse = (await analysisAPI.analyzeVideo(
        exerciseType,
        uploadState.file,
        (progress) => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.min(progress, 70), // Leave 30% for processing
          }));
        }
      )) as {
        success: boolean;
        error?: string;
        submissionId?: string;
        submission?: {
          _id: string;
          exerciseType: string;
          result: number;
          resultUnit: string;
          percentile: number;
          analysisResults: {
            total_reps?: number;
            left_reps?: number;
            right_reps?: number;
            form_score?: number;
            consistency_score?: number;
            max_height_cm?: number;
            jump_count?: number;
            cheat_detected?: boolean;
            form_issues?: string[];
            frames_processed?: number;
            detection_quality?: number;
          };
          videoFilename?: string;
          createdAt: string;
        };
      };

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || "Analysis failed");
      }

      const submission = uploadResponse.submission;
      const analysisResults = submission?.analysisResults;

      // Processing phase
      setUploadState((prev) => ({
        ...prev,
        status: "processing",
        progress: 85,
      }));

      toast({
        title: "Processing Complete",
        description: "Analysis results are ready!",
      });

      setUploadState((prev) => ({
        ...prev,
        progress: 100,
        status: "complete",
      }));

      // Format results for parent component
      const formattedResults: VideoAnalysisResults = {
        submissionId: submission?._id || uploadResponse.submissionId || "",
        exerciseType: submission?.exerciseType || exerciseType,
        metrics: {
          repCount:
            analysisResults?.total_reps || analysisResults?.jump_count || 0,
          formScore: analysisResults?.form_score || 75,
          averageSpeed: 0, // Not provided by backend
          sessionTime: 30, // Default session time
          maxHeight: analysisResults?.max_height_cm,
          consistencyScore: analysisResults?.consistency_score || 80,
          formIssues: analysisResults?.form_issues || [],
          overallScore: submission?.result || analysisResults?.form_score || 75,
        },
        analysis: {
          strengths: ["Good technique detected", "Consistent form"],
          improvements:
            analysisResults?.form_issues?.map((issue) => `Address ${issue}`) ||
            [],
          recommendations: ["Continue practicing", "Focus on form consistency"],
          overallScore: submission?.result || analysisResults?.form_score || 75,
        },
        videoUrl: submission?.videoFilename
          ? analysisAPI.getVideoUrl(submission.videoFilename)
          : undefined,
        // Legacy format for compatibility
        exercise: exerciseType,
        results: analysisResults,
        totalReps:
          analysisResults?.total_reps || analysisResults?.jump_count || 0,
        maxHeight: analysisResults?.max_height_cm,
        formQuality: analysisResults?.form_score,
        consistencyScore: analysisResults?.consistency_score,
        cheatingDetected: analysisResults?.cheat_detected || false,
        formIssues: analysisResults?.form_issues || [],
        framesProcessed: analysisResults?.frames_processed || 0,
        detectionQuality: analysisResults?.detection_quality || 0,
        leftReps: analysisResults?.left_reps,
        rightReps: analysisResults?.right_reps,
        submission: submission,
      };

      toast({
        title: "Analysis Complete",
        description: `Your ${exerciseType.replace(
          "-",
          " "
        )} video has been successfully analyzed.`,
      });

      // Pass results to parent
      onComplete(formattedResults);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      }));

      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload and analyze video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFile = () => {
    setUploadState({
      file: null,
      progress: 0,
      status: "idle",
    });

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "processing":
      case "uploading":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "processing":
      case "uploading":
        return <Upload className="h-4 w-4 animate-pulse" />;
      default:
        return <FileVideo className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {exerciseType.replace("-", " ")} - Video Upload
            </CardTitle>
            <Badge
              variant="outline"
              className={getStatusColor(uploadState.status)}
            >
              {getStatusIcon(uploadState.status)}
              <span className="ml-1 capitalize">{uploadState.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!uploadState.file && (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileVideo className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Upload Exercise Video
              </h3>
              <p className="text-muted-foreground mb-4">
                Drop your video here or click to select
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: MP4, WebM, MOV, AVI</p>
                <p>Maximum file size: 100MB</p>
                <p>Recommended: 720p or higher, good lighting</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* File Preview */}
          {uploadState.file && videoPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{uploadState.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadState.file.size)} •{" "}
                      {uploadState.file.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={
                    uploadState.status === "uploading" ||
                    uploadState.status === "processing"
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Video Preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                />
              </div>

              {/* Upload Progress */}
              {(uploadState.status === "uploading" ||
                uploadState.status === "processing") && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {uploadState.status === "uploading"
                        ? "Uploading..."
                        : "Processing..."}
                    </span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <Progress value={uploadState.progress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadState.status === "uploading"
                      ? "Uploading video to analysis server..."
                      : "AI is analyzing your exercise form and counting reps..."}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {uploadState.status === "error" && uploadState.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    {uploadState.error}
                  </p>
                </div>
              )}

              {/* Success Display */}
              {uploadState.status === "complete" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Analysis Complete
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your video has been successfully analyzed. Results are
                    ready!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!uploadState.file ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Video
              </Button>
            ) : (
              <Button
                onClick={uploadVideo}
                disabled={
                  uploadState.status === "uploading" ||
                  uploadState.status === "processing" ||
                  uploadState.status === "complete"
                }
                className="flex-1"
              >
                {uploadState.status === "uploading" ||
                uploadState.status === "processing" ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    {uploadState.status === "uploading"
                      ? "Uploading..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze Video
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
