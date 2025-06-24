
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Mic, History, Share, Download, BarChart3, Leaf, Recycle, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import ImageCapture from './ImageCapture';
import ScanResults from './ScanResults';
import ScanHistory from './ScanHistory';
import VoiceInput from './VoiceInput';
import { ScanResult } from './types';

const EcoScanApp = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState('scan');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock AI analysis function
  const analyzeImage = async (imageData: string): Promise<ScanResult> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock classification results
    const mockResults: ScanResult[] = [
      {
        id: Date.now().toString(),
        image: imageData,
        objectName: 'Plastic Water Bottle',
        classification: 'recyclable',
        confidence: 94,
        materials: ['PET Plastic', 'Polypropylene Cap'],
        environmentalImpact: {
          carbonFootprint: 'Medium',
          recyclability: 'High',
          biodegradability: 'Low'
        },
        disposalTips: [
          'Remove cap and label before recycling',
          'Rinse bottle to remove residue',
          'Check local recycling guidelines'
        ],
        reuseSuggestions: [
          'Plant pot for seedlings',
          'Storage container for small items',
          'DIY bird feeder'
        ],
        educationalFacts: [
          'PET bottles can be recycled into clothing fibers',
          'One bottle takes 450 years to decompose naturally',
          'Recycling one bottle saves energy equivalent to powering a 60W bulb for 6 hours'
        ],
        timestamp: new Date().toISOString()
      },
      {
        id: Date.now().toString(),
        image: imageData,
        objectName: 'Glass Jar',
        classification: 'reusable',
        confidence: 98,
        materials: ['Soda-lime Glass', 'Metal Lid'],
        environmentalImpact: {
          carbonFootprint: 'Low',
          recyclability: 'Very High',
          biodegradability: 'Never'
        },
        disposalTips: [
          'Remove labels and adhesive',
          'Separate metal lid for recycling',
          'Clean thoroughly before disposal'
        ],
        reuseSuggestions: [
          'Food storage container',
          'Candle holder',
          'Organize small items like screws or buttons'
        ],
        educationalFacts: [
          'Glass can be recycled infinitely without quality loss',
          'Recycled glass uses 40% less energy than new glass',
          'Glass containers preserve food quality better than plastic'
        ],
        timestamp: new Date().toISOString()
      }
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleImageCapture = useCallback(async (imageData: string) => {
    setCurrentImage(imageData);
    setIsScanning(true);
    
    try {
      const result = await analyzeImage(imageData);
      setScanResult(result);
      setScanHistory(prev => [result, ...prev]);
      toast({
        title: "Scan Complete!",
        description: `Identified: ${result.objectName} (${result.confidence}% confidence)`
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        handleImageCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            🌍 EcoScan AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent waste classification and sustainability insights powered by AI
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Capture or Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageCapture 
                  onImageCapture={handleImageCapture}
                  isScanning={isScanning}
                />
                
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  <VoiceInput onVoiceCommand={(command) => {
                    toast({
                      title: "Voice Command",
                      description: `Received: "${command}"`
                    });
                  }} />
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {isScanning && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <h3 className="text-lg font-semibold">Analyzing Image...</h3>
                    <p className="text-muted-foreground">AI is identifying the object and classifying its eco-properties</p>
                    <Progress value={85} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            {scanResult ? (
              <ScanResults 
                result={scanResult}
                onShare={() => {
                  navigator.share?.({
                    title: `EcoScan: ${scanResult.objectName}`,
                    text: `Scanned ${scanResult.objectName} - Classification: ${scanResult.classification}`,
                    url: window.location.href
                  }).catch(() => {
                    toast({
                      title: "Shared to clipboard",
                      description: "Scan result copied to clipboard"
                    });
                  });
                }}
                onDownload={() => {
                  const element = document.createElement('a');
                  const file = new Blob([JSON.stringify(scanResult, null, 2)], 
                    { type: 'application/json' });
                  element.href = URL.createObjectURL(file);
                  element.download = `ecoscan-${scanResult.objectName.toLowerCase().replace(/\s+/g, '-')}.json`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  
                  toast({
                    title: "Report Downloaded",
                    description: "Scan report saved to your device"
                  });
                }}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scan results yet. Capture or upload an image to get started!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ScanHistory 
              history={scanHistory}
              onSelectResult={(result) => {
                setScanResult(result);
                setActiveTab('results');
              }}
            />
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Similar Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search functionality coming soon!</p>
                  <p className="text-sm mt-2">Find similar reusable products and alternatives</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EcoScanApp;
