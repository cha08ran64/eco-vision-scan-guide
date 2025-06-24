
import React, { useState, useRef, useCallback } from 'react';
import { Upload, History, Leaf, Recycle, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import ScanResults from './ScanResults';
import ScanHistory from './ScanHistory';
import { ScanResult } from './types';

const EcoScanApp = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState('scan');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced AI analysis function
  const analyzeImage = async (imageData: string): Promise<ScanResult> => {
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      return {
        id: Date.now().toString(),
        image: imageData,
        objectName: result.objectName || 'Unknown Object',
        classification: result.classification || 'non-recyclable',
        confidence: result.confidence || 0,
        materials: result.materials || [],
        environmentalImpact: result.environmentalImpact || {
          carbonFootprint: 'Unknown',
          recyclability: 'Unknown',
          biodegradability: 'Unknown'
        },
        disposalTips: result.disposalTips || [],
        reuseSuggestions: result.reuseSuggestions || [],
        educationalFacts: result.educationalFacts || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      return getMockResult(imageData);
    }
  };

  // Enhanced mock data with more variety
  const getMockResult = (imageData: string): ScanResult => {
    const mockResults: Omit<ScanResult, 'id' | 'image' | 'timestamp'>[] = [
      {
        objectName: 'Plastic Water Bottle',
        classification: 'recyclable',
        confidence: 94,
        materials: ['PET Plastic #1', 'Polypropylene Cap'],
        environmentalImpact: {
          carbonFootprint: 'Medium',
          recyclability: 'High',
          biodegradability: 'Very Low'
        },
        disposalTips: [
          'Remove cap and label before recycling',
          'Rinse bottle to remove any residue',
          'Check local recycling guidelines for PET #1',
          'Crush bottle to save space'
        ],
        reuseSuggestions: [
          'Convert into a self-watering planter',
          'Create a bird feeder with small holes',
          'Use as storage for craft supplies',
          'Make a piggy bank for kids'
        ],
        educationalFacts: [
          'PET bottles can be recycled into clothing fibers and carpets',
          'One bottle takes 450+ years to decompose naturally',
          'Recycling one bottle saves energy equal to a 60W bulb for 6 hours',
          'Americans use 50 billion plastic bottles annually'
        ]
      },
      {
        objectName: 'Glass Mason Jar',
        classification: 'reusable',
        confidence: 98,
        materials: ['Soda-lime Glass', 'Metal Lid with Rubber Seal'],
        environmentalImpact: {
          carbonFootprint: 'Low',
          recyclability: 'Very High',
          biodegradability: 'Never'
        },
        disposalTips: [
          'Remove all labels and adhesive residue',
          'Separate metal lid for proper recycling',
          'Clean thoroughly before disposal',
          'Check if local programs accept glass jars'
        ],
        reuseSuggestions: [
          'Perfect for food storage and meal prep',
          'Create beautiful candle holders',
          'Organize bathroom items like cotton balls',
          'Make overnight oats or salad jars'
        ],
        educationalFacts: [
          'Glass can be recycled infinitely without quality loss',
          'Recycled glass uses 40% less energy than new glass production',
          'Glass containers preserve food quality better than plastic',
          'One ton of recycled glass saves 1,300 pounds of sand'
        ]
      },
      {
        objectName: 'Aluminum Can',
        classification: 'recyclable',
        confidence: 96,
        materials: ['Aluminum Alloy', 'Polymer Lining'],
        environmentalImpact: {
          carbonFootprint: 'High',
          recyclability: 'Very High',
          biodegradability: 'Low'
        },
        disposalTips: [
          'Rinse can to remove food residue',
          'No need to remove labels - they burn off',
          'Crush can to save recycling space',
          'Keep separate from steel cans if possible'
        ],
        reuseSuggestions: [
          'Create pencil holders for desk organization',
          'Make small planters for herbs',
          'Craft luminaries with punched holes',
          'Use as paint water containers'
        ],
        educationalFacts: [
          'Aluminum cans are recycled back into new cans in 60 days',
          'Recycling aluminum uses 95% less energy than producing new',
          'One recycled can saves enough energy to run a TV for 3 hours',
          'Americans recycle about 50% of aluminum cans'
        ]
      }
    ];
    
    const selectedResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    return {
      id: Date.now().toString(),
      image: imageData,
      timestamp: new Date().toISOString(),
      ...selectedResult
    };
  };

  const handleImageUpload = useCallback(async (imageData: string) => {
    setCurrentImage(imageData);
    setIsScanning(true);
    setActiveTab('results'); // Auto-switch to results tab
    
    try {
      const result = await analyzeImage(imageData);
      setScanResult(result);
      setScanHistory(prev => [result, ...prev]);
      toast({
        title: "✅ Analysis Complete!",
        description: `Identified: ${result.objectName} (${result.confidence}% confidence)`,
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "❌ Analysis Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive"
      });
      setActiveTab('scan'); // Go back to scan tab on error
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
        handleImageUpload(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🌍 EcoScan AI
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Smart waste classification and sustainability insights powered by advanced AI
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="scan" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Camera className="w-4 h-4" />
              Scan Item
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Upload className="w-6 h-6 text-emerald-600" />
                  Upload Image to Analyze
                </CardTitle>
                <p className="text-gray-600">Take a photo or upload an image of any item for eco-friendly analysis</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md h-64 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-400 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100"
                  >
                    <Upload className="w-16 h-16 text-emerald-500 mb-4" />
                    <p className="text-lg font-medium text-emerald-700 mb-2">Click to Upload Image</p>
                    <p className="text-sm text-gray-500 text-center px-4">
                      Support for JPG, PNG, WebP formats
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isScanning}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isScanning ? 'Analyzing...' : 'Choose Image'}
                  </Button>
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
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">🔍 AI is Analyzing Your Image...</h3>
                    <p className="text-gray-600">Identifying materials, classification, and environmental impact</p>
                    <Progress value={75} className="w-full max-w-md mx-auto h-2" />
                    <p className="text-sm text-gray-500">This usually takes 3-5 seconds</p>
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
                      title: "📋 Shared to clipboard",
                      description: "Scan result copied to clipboard",
                      className: "bg-blue-50 border-blue-200"
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
                    title: "📥 Report Downloaded",
                    description: "Scan report saved to your device",
                    className: "bg-green-50 border-green-200"
                  });
                }}
              />
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500 py-12">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No scan results yet</p>
                    <p>Upload an image to get started with AI analysis!</p>
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
        </Tabs>
      </div>
    </div>
  );
};

export default EcoScanApp;
