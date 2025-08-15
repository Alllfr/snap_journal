import React, { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import '../../../css/journal-form.css';

export default function Create() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingDurationRef = useRef(0);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    note: '',
    image_path: '', 
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const MIN_DURATION = 3;
  const MAX_DURATION = 5;

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopCamera();
    };
  }, [previewUrl]);

  const startTimer = () => {
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 1;
        recordingDurationRef.current = newDuration;
        if (newDuration >= MAX_DURATION) stopRecording();
        return newDuration;
      });
    }, 1000);
  };

  const startCamera = async () => {
    setIsCapturing(true);
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(timerRef.current);
        setIsRecording(false);
        stopCamera();

        if (recordingDurationRef.current < MIN_DURATION) {
          alert(`Video must be at least ${MIN_DURATION} seconds.`);
          setData('image_path', '');
          setPreviewUrl(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          setData('image_path', reader.result);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      startTimer();
    } catch (err) {
      alert('Camera access denied or unavailable. ' + err.message);
      setIsCapturing(false);
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCapturing(false);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const retakeVideo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setData({ ...data, image_path: '' });
    startCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.image_path) {
      alert('Please record a video first.');
      return;
    }
    post(route('journals.store'));
  };

  return (
    <div className="journal-container">
      <Head title="Create Journal" />
      <div className="journal-card max-w-xl mx-auto">
        <h1 className="journal-title">Create Journal</h1>

        <form onSubmit={handleSubmit} className="journal-form">
          <label>Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

          <label>Note</label>
          <textarea
            value={data.note}
            onChange={(e) => setData('note', e.target.value)}
            rows="4"
          />
          {errors.note && <p className="text-red-500 text-sm">{errors.note}</p>}

          <label>Record Your Emotion Here</label>

          {!previewUrl && !isCapturing && (
            <button type="button" onClick={startCamera} className="btn-pink w-full">
              Start Recording
            </button>
          )}

          {isCapturing && isRecording && (
            <div className="journal-preview">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded w-full h-[180px] object-cover"
              />
              <p className="text-center text-sm mt-1">
                Recording: {recordingDuration}s / {MAX_DURATION}s
              </p>
              <div className="progress-bar-container mt-2 w-full bg-gray-300 rounded h-2">
                <div
                  className="progress-bar-fill bg-pink-400 h-2 rounded"
                  style={{ width: `${(recordingDuration / MAX_DURATION) * 100}%` }}
                />
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="btn-pink w-full mt-2"
              >
                Stop Recording
              </button>
            </div>
          )}

          {previewUrl && !isRecording && (
            <div className="journal-preview">
              <video
                src={previewUrl}
                controls
                className="rounded w-full h-[180px] object-cover"
              />
              <button
                type="button"
                onClick={retakeVideo}
                className="btn-pink w-full mt-2"
              >
                Retake Video
              </button>
            </div>
          )}

          {errors.image_path && <p className="text-red-500 text-sm">{errors.image_path}</p>}

          <div className="flex justify-between mt-4">
            <Link href={route('journals.index')} className="btn-red">
              Cancel
            </Link>
            <button type="submit" disabled={processing} className="btn-pink">
              {processing ? 'Saving...' : 'Save Journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
