
import React from 'react';
import { Calendar, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanResult } from './types';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelectResult: (result: ScanResult) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onSelectResult }) => {
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'reusable': return 'bg-green-500';
      case 'recyclable': return 'bg-blue-500';
      case 'non-recyclable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scan history yet</p>
            <p className="text-sm mt-2">Your previous scans will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scan History ({history.length})
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {history.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={result.image}
                  alt={result.objectName}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{result.objectName}</h3>
                    <Badge
                      className={`${getClassificationColor(result.classification)} text-white text-xs`}
                    >
                      {result.classification}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.confidence}% confidence • {formatDate(result.timestamp)}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {result.materials.slice(0, 3).map((material, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                    {result.materials.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{result.materials.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => onSelectResult(result)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;
