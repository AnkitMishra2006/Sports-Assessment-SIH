import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Play, Square } from 'lucide-react';

export type ExerciseType = 'bicep-curls' | 'sit-ups' | 'vertical-jump';
export type AnalysisMode = 'live' | 'upload';

interface ExerciseSelectorProps {
  onStartAnalysis: (exercise: ExerciseType, mode: AnalysisMode) => void;
}

const exercises = [
  { value: 'bicep-curls', label: 'Bicep Curls', description: 'Upper body strength assessment' },
  { value: 'sit-ups', label: 'Sit-ups', description: 'Core strength and endurance' },
  { value: 'vertical-jump', label: 'Vertical Jump', description: 'Lower body power measurement' },
];

export function ExerciseSelector({ onStartAnalysis }: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('live');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStart = () => {
    if (!selectedExercise) return;
    setIsAnalyzing(true);
    onStartAnalysis(selectedExercise, analysisMode);
  };

  const handleStop = () => {
    setIsAnalyzing(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Exercise Assessment</CardTitle>
        <p className="text-muted-foreground text-center">
          Select an exercise and analysis method to begin your assessment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Exercise</label>
          <Select value={selectedExercise || ''} onValueChange={(value) => setSelectedExercise(value as ExerciseType)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an exercise to assess" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.value} value={exercise.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{exercise.label}</span>
                    <span className="text-xs text-muted-foreground">{exercise.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Analysis Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={analysisMode === 'live' ? 'default' : 'outline'}
              className="h-16 flex-col gap-2"
              onClick={() => setAnalysisMode('live')}
            >
              <Camera className="h-5 w-5" />
              <span className="text-sm">Live Analysis</span>
            </Button>
            <Button
              variant={analysisMode === 'upload' ? 'default' : 'outline'}
              className="h-16 flex-col gap-2"
              onClick={() => setAnalysisMode('upload')}
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm">Video Upload</span>
            </Button>
          </div>
        </div>

        {selectedExercise && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Selected Exercise</h3>
              <Badge variant="secondary">{exercises.find(e => e.value === selectedExercise)?.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {exercises.find(e => e.value === selectedExercise)?.description}
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Camera className="h-3 w-3 mr-1" />
                {analysisMode === 'live' ? 'Real-time' : 'Upload'} mode
              </Badge>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!isAnalyzing ? (
            <Button 
              onClick={handleStart} 
              disabled={!selectedExercise}
              className="flex-1 h-12"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Analysis
            </Button>
          ) : (
            <Button 
              onClick={handleStop} 
              variant="destructive"
              className="flex-1 h-12"
              size="lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Analysis
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}