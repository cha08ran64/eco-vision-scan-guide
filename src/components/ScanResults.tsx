
import React from 'react';
import { Share, Download, Leaf, Recycle, Trash2, Lightbulb, AlertTriangle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScanResult } from './types';

interface ScanResultsProps {
  result: ScanResult;
  onShare: () => void;
  onDownload: () => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({ result, onShare, onDownload }) => {
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'reusable': return 'bg-green-500';
      case 'recyclable': return 'bg-blue-500';
      case 'non-recyclable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'reusable': return <Leaf className="w-4 h-4" />;
      case 'recyclable': return <Recycle className="w-4 h-4" />;
      case 'non-recyclable': return <Trash2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'very high': return 'text-green-600';
      case 'never': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{result.objectName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getClassificationColor(result.classification)} text-white`}>
                  {getClassificationIcon(result.classification)}
                  <span className="ml-1 capitalize">{result.classification}</span>
                </Badge>
                <Badge variant="outline">
                  <Award className="w-3 h-3 mr-1" />
                  {result.confidence}% Confidence
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={onShare} variant="outline" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button onClick={onDownload} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img
                src={result.image}
                alt={result.objectName}
                className="w-full rounded-lg shadow-md object-cover"
                style={{ maxHeight: '300px' }}
              />
            </div>
            
            {/* Quick Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Materials Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {result.materials.map((material, index) => (
                    <Badge key={index} variant="secondary">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Environmental Impact</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Carbon Footprint:</span>
                    <span className={getImpactColor(result.environmentalImpact.carbonFootprint)}>
                      {result.environmentalImpact.carbonFootprint}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recyclability:</span>
                    <span className={getImpactColor(result.environmentalImpact.recyclability)}>
                      {result.environmentalImpact.recyclability}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biodegradability:</span>
                    <span className={getImpactColor(result.environmentalImpact.biodegradability)}>
                      {result.environmentalImpact.biodegradability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Disposal Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Disposal Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.disposalTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Reuse Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Recycle className="w-5 h-5 text-green-500" />
              Reuse Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.reuseSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Educational Facts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              Did You Know?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.educationalFacts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">{fact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">AI Confidence Score</span>
              <span className="text-sm text-muted-foreground">{result.confidence}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Higher scores indicate more accurate identification and classification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResults;
