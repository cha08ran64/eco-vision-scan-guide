
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ImageCaptureProps {
  onImageCapture: (imageData: string) => void;
  isScanning: boolean;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onImageCapture, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsStreaming(true);
              toast({
                title: "Camera Started",
                description: "Point your camera at the object to scan"
              });
            }).catch((playError) => {
              console.error('Error playing video:', playError);
              toast({
                title: "Camera Error",
                description: "Failed to start video playback",
                variant: "destructive"
              });
            });
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access and try again",
        variant: "destructive"
      });
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onImageCapture(imageData);
        stopCamera();
        
        toast({
          title: "Image Captured",
          description: "Processing image for analysis..."
        });
      } else {
        toast({
          title: "Capture Failed",
          description: "Please wait for camera to fully load",
          variant: "destructive"
        });
      }
    }
  }, [onImageCapture, stopCamera]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (isStreaming) {
      stopCamera();
      // Small delay to ensure camera is properly stopped before starting
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  }, [facingMode, isStreaming, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
              muted
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
                {isScanning ? 'Processing...' : 'Capture'}
              </Button>
              
              <Button
                onClick={switchCamera}
                variant="outline"
                disabled={isScanning}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Switch
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="outline"
                disabled={isScanning}
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
