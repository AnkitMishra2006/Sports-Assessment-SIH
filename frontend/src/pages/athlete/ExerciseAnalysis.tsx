import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedExerciseSelector as ExerciseSelector, type ExerciseType, type AnalysisMode } from '@/components/Exercise/EnhancedExerciseSelector';
import { LiveAnalysisInterface } from '@/components/Exercise/LiveAnalysisInterface';
import { VideoUploadInterface } from '@/components/Exercise/VideoUploadInterface';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { useToast } from '@/hooks/use-toast';

type AppState = 'selection' | 'analysis' | 'results';

interface AnalysisResults {
  exercise: ExerciseType;
  totalReps: number;
  formQuality: number;
  cheatingDetected: boolean;
  averageSpeed: number;
  duration: number;
  stages: string[];
  sessionTime?: number;
}

export default function ExerciseAnalysis() {
  const [appState, setAppState] = useState<AppState>('selection');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('live');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartAnalysis = (exercise: ExerciseType, mode: AnalysisMode) => {
    setSelectedExercise(exercise);
    setSelectedMode(mode);
    setAppState('analysis');
  };

  const handleAnalysisComplete = (results: AnalysisResults) => {
    setAnalysisResults(results);
    setAppState('results');
    toast({
      title: "Analysis Complete",
      description: `Your ${results.exercise.replace('-', ' ')} assessment has been completed.`,
    });
  };

  const handleSaveResults = () => {
    if (!analysisResults) return;
    
    // Save to localStorage (mock backend)
    const existingData = JSON.parse(localStorage.getItem('athlete_data') || '{}');
    const exerciseHistory = existingData.exerciseHistory || [];
    
    const newEntry = {
      id: Date.now().toString(),
      exercise: analysisResults.exercise,
      date: new Date().toISOString(),
      reps: analysisResults.totalReps,
      formQuality: analysisResults.formQuality,
      duration: analysisResults.duration,
      cheatingDetected: analysisResults.cheatingDetected,
      mode: selectedMode,
    };
    
    exerciseHistory.push(newEntry);
    existingData.exerciseHistory = exerciseHistory;
    localStorage.setItem('athlete_data', JSON.stringify(existingData));
    
    toast({
      title: "Results Saved",
      description: "Your analysis results have been saved to your profile.",
    });
  };

  const handleNewAnalysis = () => {
    setAppState('selection');
    setSelectedExercise(null);
    setAnalysisResults(null);
  };

  const handleBack = () => {
    if (appState === 'analysis') {
      setAppState('selection');
    } else if (appState === 'results') {
      setAppState('analysis');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Exercise Analysis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get real-time feedback on your exercise form and performance using advanced AI analysis
          </p>
        </div>

        {appState === 'selection' && (
          <ExerciseSelector onStartAnalysis={handleStartAnalysis} />
        )}

        {appState === 'analysis' && selectedExercise && (
          <>
            {selectedMode === 'live' ? (
              <LiveAnalysisInterface
                exerciseType={selectedExercise}
                onComplete={handleAnalysisComplete}
                onBack={handleBack}
              />
            ) : (
              <VideoUploadInterface
                exerciseType={selectedExercise}
                onComplete={handleAnalysisComplete}
                onBack={handleBack}
              />
            )}
          </>
        )}

        {appState === 'results' && analysisResults && (
          <ResultsDashboard
            results={analysisResults}
            onNewAnalysis={handleNewAnalysis}
            onSaveResults={handleSaveResults}
          />
        )}
      </div>
    </div>
  );
}