
import React, { useRef, useState, useCallback } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageCaptureProps {
  onImageCapture: (imageData: string) => void;
  isScanning: boolean;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onImageCapture, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onImageCapture(imageData);
        stopCamera();
      }
    }
  }, [onImageCapture, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, startCamera, stopCamera]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {!isStreaming ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Start camera to capture an image</p>
            <Button onClick={startCamera} className="gradient-eco text-white">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg shadow-lg"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            
            <div className="flex justify-center gap-4 mt-4">
              <Button
                onClick={captureImage}
                disabled={isScanning}
                className="gradient-eco text-white px-8"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              
              <Button
                onClick={switchCamera}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Switch
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="outline"
              >
                Stop
              </Button>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default ImageCapture;
