import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, CheckCircle, Target, AlertCircle } from "lucide-react";

interface TestVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  testInfo: {
    id: string;
    name: string;
    description: string;
    duration: string;
    equipment: string;
    instructions: string[];
    normalValues: {
      male: { excellent: string; good: string; average: string; poor: string };
      female: { excellent: string; good: string; average: string; poor: string };
    };
  };
  onStartTest: () => void;
}

const TestVideoModal = ({ isOpen, onClose, testInfo, onStartTest }: TestVideoModalProps) => {
  const [currentTab, setCurrentTab] = useState<"video" | "instructions" | "standards">("video");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Play className="w-5 h-5 mr-2" />
            {testInfo.name} - Instructions
          </DialogTitle>
          <DialogDescription>
            Watch the video instructions and review the test guidelines before starting
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 mb-4">
          <Button
            variant={currentTab === "video" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTab("video")}
          >
            Video Guide
          </Button>
          <Button
            variant={currentTab === "instructions" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTab("instructions")}
          >
            Instructions
          </Button>
          <Button
            variant={currentTab === "standards" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTab("standards")}
          >
            Standards
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          {currentTab === "video" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Video Instructions</p>
                      <p className="text-sm text-muted-foreground">
                        Watch proper form and technique for {testInfo.name}
                      </p>
                      <Button className="mt-4" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Duration: {testInfo.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Equipment: {testInfo.equipment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentTab === "instructions" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Step-by-Step Instructions
                  </h3>
                  <div className="space-y-3">
                    {testInfo.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-warning" />
                    Important Notes
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Ensure you have adequate space and proper lighting for recording</p>
                    <p>• Warm up properly before starting the test</p>
                    <p>• Follow safety guidelines and stop if you feel any discomfort</p>
                    <p>• You can retake the test multiple times - only your best score will count</p>
                    <p>• Make sure your camera captures the full movement</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentTab === "standards" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 text-primary">Male Standards</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="default" className="bg-success">Excellent</Badge>
                        <span className="font-medium">{testInfo.normalValues.male.excellent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="default" className="bg-primary">Good</Badge>
                        <span className="font-medium">{testInfo.normalValues.male.good}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Average</Badge>
                        <span className="font-medium">{testInfo.normalValues.male.average}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="destructive">Poor</Badge>
                        <span className="font-medium">{testInfo.normalValues.male.poor}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 text-accent">Female Standards</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="default" className="bg-success">Excellent</Badge>
                        <span className="font-medium">{testInfo.normalValues.female.excellent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="default" className="bg-primary">Good</Badge>
                        <span className="font-medium">{testInfo.normalValues.female.good}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Average</Badge>
                        <span className="font-medium">{testInfo.normalValues.female.average}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="destructive">Poor</Badge>
                        <span className="font-medium">{testInfo.normalValues.female.poor}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Performance Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your performance will be automatically analyzed and compared against national standards for your age and gender. 
                    You'll receive a percentile ranking showing how you compare to other athletes across India. 
                    The system uses advanced algorithms to ensure accurate and fair assessment.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onStartTest();
              onClose();
            }}
            className="bg-gradient-hero hover:shadow-glow"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestVideoModal;