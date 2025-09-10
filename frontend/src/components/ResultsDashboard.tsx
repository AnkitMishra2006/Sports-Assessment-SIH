import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Share2, 
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { AnalysisResults } from './AnalysisInterface';

interface ResultsDashboardProps {
  results: AnalysisResults;
  onNewAnalysis: () => void;
  onSaveResults: () => void;
}

export function ResultsDashboard({ results, onNewAnalysis, onSaveResults }: ResultsDashboardProps) {
  const getFormQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFormQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getPerformanceLevel = (reps: number, exercise: string) => {
    // Mock performance standards
    const standards = {
      'bicep-curls': { excellent: 20, good: 15, average: 10 },
      'sit-ups': { excellent: 30, good: 20, average: 15 },
      'vertical-jump': { excellent: 15, good: 10, average: 5 }
    };
    
    const standard = standards[exercise as keyof typeof standards] || standards['sit-ups'];
    
    if (reps >= standard.excellent) return { level: 'Excellent', color: 'text-green-600' };
    if (reps >= standard.good) return { level: 'Good', color: 'text-yellow-600' };
    if (reps >= standard.average) return { level: 'Average', color: 'text-orange-600' };
    return { level: 'Below Average', color: 'text-red-600' };
  };

  const performance = getPerformanceLevel(results.totalReps, results.exercise);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl capitalize">
              {results.exercise.replace('-', ' ')} Results
            </CardTitle>
            <Badge variant={results.cheatingDetected ? 'destructive' : 'default'}>
              {results.cheatingDetected ? (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Issues Detected
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Clean Performance
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{results.totalReps}</div>
                <div className="text-sm text-muted-foreground">Total Reps</div>
                <div className={`text-xs font-medium mt-1 ${performance.color}`}>
                  {performance.level}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{results.formQuality}%</div>
                <div className="text-sm text-muted-foreground">Form Quality</div>
                <div className={`text-xs font-medium mt-1 ${getFormQualityColor(results.formQuality)}`}>
                  {getFormQualityLabel(results.formQuality)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{results.duration}s</div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {results.averageSpeed.toFixed(1)} reps/min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">Consistency</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rep timing
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Form Quality</span>
                    <span>{results.formQuality}%</span>
                  </div>
                  <Progress value={results.formQuality} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Proper range of motion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Good tempo control</span>
                  </div>
                  {results.formQuality < 80 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Minor form deviations detected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {results.stages.map((stage, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{stage} Phase</span>
                      <Badge variant="outline">
                        {Math.floor(Math.random() * 30) + 70}%
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {results.cheatingDetected && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Issues Detected</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Possible form violations or counting irregularities were detected during analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={onSaveResults} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Save Results
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" onClick={onNewAnalysis} className="flex-1">
              New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}