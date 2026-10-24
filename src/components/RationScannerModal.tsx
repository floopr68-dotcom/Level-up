import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, Zap, Utensils, AlertCircle, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShinobiMeal } from '../types/shinobi';
import { soundEngine } from '../utils/audio';

interface RationScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: ShinobiMeal) => void;
}

export const RationScannerModal: React.FC<RationScannerModalProps> = ({
  isOpen,
  onClose,
  onLogMeal,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [userNote, setUserNote] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when closed
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedImage(null);
      setScanResult(null);
      setErrorMsg(null);
      setShowRewardAnimation(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      soundEngine.playWhoosh();
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Could not access device camera. Please upload an image file instead or try a sample ration.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        stopCamera();
        soundEngine.playWhoosh();
      }
    } catch (err: any) {
      setErrorMsg('Failed to capture frame: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      stopCamera();
      soundEngine.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleType: 'ramen' | 'bento' | 'salad') => {
    setErrorMsg(null);
    stopCamera();
    soundEngine.playClick();

    // High quality sample images representing ninja meals
    const samples: Record<string, string> = {
      ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      bento: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    };

    // Convert sample image URL to base64 via fetch or direct placeholder
    setSelectedImage(samples[sampleType]);
  };

  const performShinobiAppraisal = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMsg(null);
    soundEngine.playChakraCharge();

    try {
      let base64Payload = selectedImage;

      // If it's a remote URL from sample, fetch and convert to base64
      if (selectedImage.startsWith('http')) {
        try {
          const resp = await fetch(selectedImage);
          const blob = await resp.blob();
          base64Payload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          // If CORS fails on sample, send note
        }
      }

      const response = await fetch('/api/ration-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Payload,
          note: userNote,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to appraise ration');
      }

      setScanResult(resData.data);
      soundEngine.playLevelUp();
    } catch (err: any) {
      console.error('Appraisal error:', err);
      setErrorMsg('Shinobi vision error: ' + (err.message || 'Please retry'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmLog = () => {
    if (!scanResult) return;

    // Trigger Stamina Recovery & Chakra Boost Animation
    setShowRewardAnimation(true);
    soundEngine.playChakraCharge();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#38bdf8', '#fbbf24', '#ffffff'],
    });

    const newMeal: ShinobiMeal = {
      id: 'meal-' + Date.now(),
      dishName: scanResult.dishName || 'Field Ration',
      shinobiName: scanResult.shinobiName || 'Shinobi Stamina Chow',
      portionSize: scanResult.portionSize || '1 portion',
      calories: Number(scanResult.calories) || 500,
      protein: Number(scanResult.protein) || 25,
      carbs: Number(scanResult.carbs) || 50,
      fats: Number(scanResult.fats) || 15,
      chakraType: scanResult.chakraType || 'Yang Physical Recovery',
      chakraBoostPoints: Number(scanResult.chakraBoostPoints) || 50,
      shinobiAppraisal: scanResult.shinobiAppraisal || 'Energized and ready for patrol!',
      healthRating: scanResult.healthRating || 'A-Rank',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImage || undefined,
    };

    onLogMeal(newMeal);

    setTimeout(() => {
      setShowRewardAnimation(false);
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0f111a] border border-orange-500/30 p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/40 text-orange-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-ninja text-base font-bold tracking-wider text-slate-100 uppercase">
              Shinobi Ration Appraisal
            </h2>
            <p className="text-xs text-orange-400/90 font-mono">
              Konoha Medical Corps AI Vision System
            </p>
          </div>
        </div>

        {/* Camera Feed / Image Preview Area */}
        <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner mb-4">
          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : selectedImage ? (
            <div className="relative w-full h-full">
              <img
                src={selectedImage}
                alt="Selected Ration"
                className="w-full h-full object-cover"
              />
              {/* Scan Overlay Lines */}
              {isScanning && (
                <div className="absolute inset-0 bg-orange-500/10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-bounce" />
                  <div className="px-4 py-1.5 rounded-full bg-black/80 border border-orange-500 text-xs font-ninja text-orange-300 font-bold tracking-widest mt-4">
                    DECIPHERING NUTRITIONAL CHAKRA...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Utensils className="w-10 h-10 text-orange-400/50 mb-2" />
              <p className="text-xs font-ninja tracking-wider text-slate-300">
                Snap or upload a photo of your meal / rations
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                AI Vision will calculate calories, macros, and stamina recovery
              </p>
            </div>
          )}

          {/* Camera Shutter Overlay Button */}
          {isCameraActive && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full bg-orange-500 text-black border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition"
                title="Capture Photo"
              >
                <div className="w-5 h-5 rounded-full bg-black" />
              </button>
            </div>
          )}
        </div>

        {/* Camera & Upload Controls */}
        {!scanResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-black font-ninja font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraActive ? 'Cancel Camera' : 'Live Camera'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-ninja font-bold text-xs uppercase tracking-wider transition active:scale-95"
              >
                <Upload className="w-4 h-4 text-orange-400" />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Quick Sample Rations for Instant Testing */}
            <div>
              <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase">
                Or Try Shinobi Field Rations:
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => handleSelectSample('ramen')}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-orange-500 hover:text-orange-400 font-ninja transition text-center"
                >
                  🍜 Ichiraku Ramen
                </button>
                <button
                  onClick={() => handleSelectSample('bento')}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-orange-500 hover:text-orange-400 font-ninja transition text-center"
                >
                  🍱 Protein Bento
                </button>
                <button
                  onClick={() => handleSelectSample('salad')}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-orange-500 hover:text-orange-400 font-ninja transition text-center"
                >
                  🥗 Shinobi Greens
                </button>
              </div>
            </div>

            {/* Optional note */}
            <div>
              <input
                type="text"
                placeholder="Optional trainee note (e.g. 'Double chicken breast', 'Less oil')"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500 transition placeholder:text-slate-600"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan Action Button */}
            {selectedImage && !isCameraActive && (
              <button
                onClick={performShinobiAppraisal}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Analyzing Shinobi Rations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black fill-black" />
                    <span>Commence AI Appraisal</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Scan Results Card */}
        {scanResult && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header Result */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-950/40 to-slate-900 border border-orange-500/40 shadow-inner">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                    [Appraisal Verdict]
                  </span>
                  <h3 className="font-ninja text-lg font-bold text-white tracking-wide">
                    {scanResult.shinobiName}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    {scanResult.dishName} • <span className="text-slate-400">{scanResult.portionSize}</span>
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-ninja font-bold text-xs uppercase">
                  {scanResult.healthRating}
                </div>
              </div>

              {/* Calories & Macros Grid */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-950/60 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Calories</span>
                  <span className="font-ninja text-base font-bold text-orange-400">
                    {scanResult.calories}
                  </span>
                  <span className="text-[9px] text-slate-500 block">kcal</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Protein</span>
                  <span className="font-ninja text-base font-bold text-cyan-400">
                    {scanResult.protein}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">Muscle</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Carbs</span>
                  <span className="font-ninja text-base font-bold text-amber-400">
                    {scanResult.carbs}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">Energy</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Fats</span>
                  <span className="font-ninja text-base font-bold text-rose-400">
                    {scanResult.fats}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">Vitality</span>
                </div>
              </div>
            </div>

            {/* Chakra Affinity & Medical Corps Appraisal */}
            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
              <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-ninja font-bold uppercase mb-1">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                <span>Chakra Effect: {scanResult.chakraType}</span>
              </div>
              <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                "{scanResult.shinobiAppraisal}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span>Stamina Recovery Bonus:</span>
                <span className="font-bold text-cyan-400">+{scanResult.chakraBoostPoints} Chakra Units</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setScanResult(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-xs font-ninja text-slate-300 hover:text-white transition active:scale-95"
              >
                Scan Another
              </button>

              <button
                onClick={handleConfirmLog}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-ninja font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                <CheckCircle className="w-4 h-4 text-black" />
                <span>Log Ration & Recover Stamina</span>
              </button>
            </div>
          </div>
        )}

        {/* Reward Animation Modal Overlay */}
        {showRewardAnimation && (
          <div className="absolute inset-0 rounded-3xl bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-cyan-400 flex items-center justify-center chakra-glow-orange animate-spin">
                <div className="w-20 h-20 rounded-full bg-[#0a0b10] flex items-center justify-center">
                  <Zap className="w-10 h-10 text-cyan-400 fill-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="font-ninja text-2xl font-extrabold text-orange-400 tracking-wider chakra-text-glow uppercase">
              Chakra Restored!
            </h3>
            <p className="text-sm text-slate-200 mt-1 font-sans">
              Shinobi Rations successfully logged to your daily scroll.
            </p>
            <div className="mt-3 px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-xs font-ninja text-cyan-300 font-bold">
              +50 EXP & Taijutsu Energy Replenished
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
