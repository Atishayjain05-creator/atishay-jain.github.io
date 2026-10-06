import React, { useState } from 'react';
import { X, Film, Upload, Sparkles, Play, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { startVeoVideoGeneration, pollVeoVideoStatus } from '../services/api.ts';

interface VeoAnimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultImage?: string;
  destination: string;
}

export const VeoAnimateModal: React.FC<VeoAnimateModalProps> = ({
  isOpen,
  onClose,
  defaultImage,
  destination
}) => {
  const [imagePreview, setImagePreview] = useState<string>(defaultImage || '');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState<string>(`Cinematic drone sweep across ${destination}, morning golden hour sunlight, architectural realism, 4k travel video`);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    setStatusMessage('Submitting photo to Veo 3.1 fast video engine...');

    try {
      let b64 = imageBase64;
      let mType = mimeType;

      // If no custom upload, convert defaultImage to base64
      if (!b64 && defaultImage) {
        setStatusMessage('Converting destination hero image for Veo processing...');
        const resp = await fetch(defaultImage);
        const blob = await resp.blob();
        mType = blob.type || 'image/jpeg';
        const reader = new FileReader();
        b64 = await new Promise((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }

      if (!b64) {
        throw new Error('Please select or upload a photo first.');
      }

      setStatusMessage('Starting Veo video generation (model: veo-3.1-fast-generate-preview)...');
      const startRes = await startVeoVideoGeneration({
        imageBase64: b64,
        mimeType: mType,
        prompt,
        aspectRatio
      });

      setOperationName(startRes.operationName);
      setStatusMessage('Veo is rendering cinematic motion (this typically takes 30-60 seconds)...');

      // Poll until done
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 40) {
        attempts++;
        await new Promise((r) => setTimeout(r, 6000));
        setStatusMessage(`Rendering scene frames... (${attempts * 6}s elapsed)`);

        const pollRes = await pollVeoVideoStatus(startRes.operationName);
        if (pollRes.error) {
          throw new Error(pollRes.error.message || 'Veo video generation error');
        }

        if (pollRes.done) {
          completed = true;
          setStatusMessage('Video rendered! Downloading video stream...');
          setVideoDownloadUrl(`/api/trips/video-download`);
        }
      }

      if (!completed) {
        throw new Error('Video generation is taking longer than usual. Please check back shortly.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate video with Veo');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">Animate Photo with Veo</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/25">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Transform travel photos into cinematic landscape or portrait videos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Photo Preview & Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#0C111A] border border-amber-500/15 aspect-video flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Target" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 text-xs text-slate-500">
                  <Upload className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                  <span>No photo selected</span>
                </div>
              )}
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <label className="block text-xs font-semibold text-slate-300">Choose or Upload Photo:</label>
              <label className="px-4 py-2.5 rounded-xl bg-[#131924] hover:bg-[#1A2232] border border-amber-500/20 text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {defaultImage && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(defaultImage); setImageBase64(''); }}
                  className="px-4 py-2 rounded-xl bg-[#0C111A] hover:bg-[#151D2A] border border-amber-500/10 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-center"
                >
                  Reset to {destination} Hero Photo
                </button>
              )}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Video Aspect Ratio:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-orange-500/15 border-orange-400 text-white shadow-sm'
                    : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-xs sm:text-sm block">16:9 Landscape</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ideal for desktops, trailers, and screens</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-orange-500/15 border-orange-400 text-white shadow-sm'
                    : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-xs sm:text-sm block">9:16 Portrait</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ideal for mobile stories & reels</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Motion Prompt:</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the desired camera movement and atmospheric animation..."
              className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Animation */}
          {generating && (
            <div className="p-6 text-center space-y-3 bg-[#0C111A]/80 rounded-2xl border border-amber-500/15">
              <Sparkles className="w-6 h-6 text-orange-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">{statusMessage}</p>
            </div>
          )}

          {/* Generated Video Player */}
          {videoDownloadUrl && operationName && !generating && (
            <div className="p-4 rounded-2xl bg-[#0C111A] border border-amber-400/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Veo Generated Video Result</span>
                </span>
                <form action="/api/trips/video-download" method="POST" target="_blank">
                  <input type="hidden" name="operationName" value={operationName} />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>
                </form>
              </div>

              <div className="rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center">
                <video
                  controls
                  autoPlay
                  loop
                  className="max-h-[300px] w-auto mx-auto rounded-xl"
                  src={`/api/trips/video-download`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-500/15 bg-[#0C111A]/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white bg-[#131924] hover:bg-[#1D2638] cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-white shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{generating ? 'Rendering Video...' : 'Generate Veo Video'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
