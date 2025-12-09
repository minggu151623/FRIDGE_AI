import React, { useRef, useState, useEffect } from 'react';
import { Icons } from './Icon';

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsInitializing(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Camera access error:", err);
          setError("Could not access camera. Please upload a file instead.");
          setIsInitializing(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video actual size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get Base64 string (remove data:image/jpeg;base64, prefix for API if needed, 
        // but our service wrapper handles parts usually. 
        // The service expects just the base64 data part often, so let's strip it.)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64, 'image/jpeg');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        onCapture(base64, mimeType);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onCancel} className="text-white p-2 rounded-full bg-white/20 backdrop-blur-sm">
          <Icons.X size={24} />
        </button>
        <span className="text-white font-medium">Scan Fridge</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 max-w-sm">
            <Icons.AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <p className="mb-6">{error}</p>
            <label className="bg-chef-500 hover:bg-chef-600 text-white px-6 py-3 rounded-full font-medium cursor-pointer transition-colors inline-flex items-center gap-2">
              <Icons.Camera size={20} />
              Upload Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            {/* Guide overlay */}
            <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
          </>
        )}
      </div>
      
      {/* Controls */}
      {!error && (
        <div className="h-32 bg-black/80 flex items-center justify-center relative">
           <label className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 flex flex-col items-center gap-1 text-xs cursor-pointer">
             <div className="p-2 rounded-full bg-white/10">
               <Icons.Leaf size={20} />
             </div>
             <span>Gallery</span>
             <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
           </label>

           <button 
             onClick={handleCapture}
             className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
           >
             <div className="w-16 h-16 bg-white rounded-full"></div>
           </button>
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
