import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface LiveMetrics {
  repCount: number;
  currentStage: string;
  formStatus: 'good' | 'bad' | 'neutral';
  formScore: number;
  sessionTime: number;
  averageSpeed: number;
}

interface MetricsDashboardProps {
  metrics: LiveMetrics;
  exerciseType: string;
  isAnalyzing: boolean;
}

export function MetricsDashboard({ metrics, exerciseType, isAnalyzing }: MetricsDashboardProps) {
  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'bad': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getFormStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'bad': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPerformanceLevel = (reps: number) => {
    if (reps >= 20) return { level: 'Excellent', color: 'text-green-600', progress: 100 };
    if (reps >= 15) return { level: 'Good', color: 'text-blue-600', progress: 80 };
    if (reps >= 10) return { level: 'Average', color: 'text-yellow-600', progress: 60 };
    if (reps >= 5) return { level: 'Fair', color: 'text-orange-600', progress: 40 };
    return { level: 'Starting', color: 'text-gray-600', progress: 20 };
  };

  const performance = getPerformanceLevel(metrics.repCount);
  const formattedTime = Math.floor(metrics.sessionTime / 60) + ':' + (Math.floor(metrics.sessionTime) % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-4">
      {/* Session Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Session Status</CardTitle>
            <Badge variant={isAnalyzing ? 'default' : 'secondary'}>
              {isAnalyzing ? 'Active' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{metrics.repCount}</div>
            <p className="text-sm text-muted-foreground">Repetitions</p>
            <div className={`text-xs mt-1 ${performance.color}`}>
              {performance.level}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{performance.progress}%</span>
            </div>
            <Progress value={performance.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-4 w-4" />
            Form Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-3 rounded-lg border ${getFormStatusColor(metrics.formStatus)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getFormStatusIcon(metrics.formStatus)}
              <span className="text-sm font-medium capitalize">
                Current Form: {metrics.formStatus}
              </span>
            </div>
            <div className="text-xs">
              Stage: <span className="font-medium">{metrics.currentStage}</span>
            </div>
          </div>

          {metrics.formScore > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Form Score</span>
                <span>{metrics.formScore}%</span>
              </div>
              <Progress 
                value={metrics.formScore} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">{formattedTime}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">
                {metrics.averageSpeed.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Reps/min</div>
            </div>
          </div>

          {/* Exercise-specific metrics */}
          {exerciseType === 'bicep-curls' && (
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="text-sm text-blue-800 font-medium">Upper Body Focus</div>
              <div className="text-xs text-blue-600">Focus on controlled movement</div>
            </div>
          )}

          {exerciseType === 'sit-ups' && (
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-sm text-green-800 font-medium">Core Strength</div>
              <div className="text-xs text-green-600">Maintain steady rhythm</div>
            </div>
          )}

          {exerciseType === 'vertical-jump' && (
            <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Zap className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <div className="text-sm text-orange-800 font-medium">Explosive Power</div>
              <div className="text-xs text-orange-600">Maximize jump height</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Tips */}
      {isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Real-time Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {metrics.formStatus === 'bad' && (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Check your form - maintain proper posture</span>
                </div>
              )}
              
              {metrics.averageSpeed > 40 && (
                <div className="flex items-start gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Slow down for better form quality</span>
                </div>
              )}
              
              {metrics.formStatus === 'good' && metrics.repCount > 0 && (
                <div className="flex items-start gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Great form! Keep it up</span>
                </div>
              )}
              
              {!isAnalyzing && (
                <div className="text-center text-muted-foreground">
                  Start analysis to see real-time feedback
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}