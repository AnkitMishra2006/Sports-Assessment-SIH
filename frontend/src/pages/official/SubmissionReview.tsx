import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Target,
  Video,
  FileText,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Flag
} from "lucide-react";
import { mockSubmissions, fitnessTests } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const SubmissionReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [officialData, setOfficialData] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "rejected" | "flagged">("pending");

  useEffect(() => {
    const session = localStorage.getItem("officialSession");
    if (session) {
      setOfficialData(JSON.parse(session));
    }

    // Find the submission
    const foundSubmission = mockSubmissions.find(sub => sub.id === submissionId);
    if (foundSubmission) {
      setSubmission(foundSubmission);
      setReviewStatus(foundSubmission.status);
    }
  }, [submissionId]);

  if (!officialData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please login as an official to access this review.</p>
            <Link to="/official/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested submission could not be found.</p>
            <Link to="/official/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const test = fitnessTests.find(t => t.id === submission.testType);

  const handleReviewAction = (action: "approve" | "reject" | "flag") => {
    const newStatus = action === "approve" ? "approved" : 
                     action === "reject" ? "rejected" : "flagged";
    
    setReviewStatus(newStatus);
    
    toast({
      title: `Submission ${action}d`,
      description: `The submission has been ${action}d successfully.`,
      variant: action === "reject" ? "destructive" : "default"
    });

    // In a real app, this would make an API call
    setTimeout(() => {
      navigate("/official/dashboard");
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "destructive";
      case "flagged": return "warning";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "rejected": return XCircle;
      case "flagged": return AlertTriangle;
      default: return Target;
    }
  };

  const StatusIcon = getStatusIcon(reviewStatus);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/official/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold text-accent">Submission Review</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={getStatusColor(reviewStatus) as any}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {reviewStatus}
            </Badge>
            <span className="text-sm text-muted-foreground">ID: {submission.id}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  Test Recording
                </CardTitle>
                <CardDescription>
                  {test?.name} - {submission.athleteName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-80 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Video Player Placeholder</p>
                    <p className="text-sm text-muted-foreground">{submission.videoUrl}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline">0.5x Speed</Button>
                    <Button size="sm" variant="outline">Frame by Frame</Button>
                  </div>
                  <span className="text-sm text-muted-foreground">Duration: 2:34</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analysis */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{submission.result}</div>
                    <p className="text-sm text-muted-foreground">Test Result</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">{submission.percentile}th</div>
                    <p className="text-sm text-muted-foreground">Percentile</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-1">{submission.aiAnalysis.formScore}</div>
                    <p className="text-sm text-muted-foreground">Form Score</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">AI Analysis Results</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Form Assessment</span>
                        <span>{submission.aiAnalysis.formScore}/100</span>
                      </div>
                      <Progress value={submission.aiAnalysis.formScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Consistency Score</span>
                        <span>{submission.aiAnalysis.consistencyScore}/100</span>
                      </div>
                      <Progress value={submission.aiAnalysis.consistencyScore} />
                    </div>
                  </div>
                </div>

                {submission.aiAnalysis.flaggedIssues.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 text-warning">Flagged Issues</h4>
                      <div className="space-y-2">
                        {submission.aiAnalysis.flaggedIssues.map((issue: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-warning/10 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {test && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Test Instructions Reference</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <ul className="space-y-1 text-sm">
                          {test.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary mr-2">{index + 1}.</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Review Notes */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Review Notes
                </CardTitle>
                <CardDescription>
                  Add your review comments and observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Official Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter your review notes here..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="flex-1 bg-gradient-success"
                      onClick={() => handleReviewAction("approve")}
                      disabled={reviewStatus === "approved"}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve Submission
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleReviewAction("reject")}
                      disabled={reviewStatus === "rejected"}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject Submission
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleReviewAction("flag")}
                      disabled={reviewStatus === "flagged"}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Flag for Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Athlete Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Athlete Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{submission.athleteName}</h3>
                  <p className="text-muted-foreground">{submission.age} years old</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{submission.gender}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{submission.district}, {submission.state}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Test Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Test Type</span>
                      <span>{test?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{test?.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipment</span>
                      <span>{test?.equipment}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  View Athlete Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View Previous Submissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Compare with Standards
                </Button>
              </CardContent>
            </Card>

            {/* Review Guidelines */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <h5 className="font-medium text-success mb-1">Approve if:</h5>
                    <ul className="text-success/80 space-y-1">
                      <li>• Proper form maintained</li>
                      <li>• Video quality is clear</li>
                      <li>• No cheating detected</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <h5 className="font-medium text-destructive mb-1">Reject if:</h5>
                    <ul className="text-destructive/80 space-y-1">
                      <li>• Clear rule violations</li>
                      <li>• Poor video quality</li>
                      <li>• Evidence of cheating</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <h5 className="font-medium text-warning mb-1">Flag if:</h5>
                    <ul className="text-warning/80 space-y-1">
                      <li>• Uncertain about form</li>
                      <li>• Needs second opinion</li>
                      <li>• Borderline case</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;