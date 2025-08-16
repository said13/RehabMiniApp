import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { ExercisesSection } from 'src/components/admin/ExercisesSection';
import type { Training, Exercise } from 'src/types';

export default function TrainingExercisesPage() {
  const router = useRouter();
  const { categoryId, trainingId } = router.query as { categoryId?: string; trainingId?: string };
  const [training, setTraining] = useState<Training | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  type ExerciseForm = Omit<Exercise, 'id'>;
  const [pendingExercises, setPendingExercises] = useState<ExerciseForm[]>([]);
  const [sectionKey, setSectionKey] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!trainingId) return;
    fetchTraining();
  }, [trainingId]);

  const fetchTraining = async () => {
    const res = await fetch(`/api/trainings/${trainingId}`);
    const data = await res.json();
    setTraining(data);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    setUploadProgress(new Array(fileArr.length).fill(0));
    const meta = fileArr.map((f) => ({ filename: f.name, contentType: f.type }));
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: meta }),
    });
    const { uploads } = await res.json();
    uploads.forEach((u: any, idx: number) => {
      const file = fileArr[idx];
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', u.uploadUrl);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((prev) => {
            const next = [...prev];
            next[idx] = Math.round((e.loaded / e.total) * 100);
            return next;
          });
        }
      };
      xhr.onload = () => {
        setUploadProgress((prev) => {
          const next = [...prev];
          next[idx] = 100;
          return next;
        });
        setPendingExercises((prev) => [
          ...prev,
          {
            title: '',
            complexId: '',
            muxId: u.assetId,
            videoUrl: `https://stream.mux.com/${u.assetId}.m3u8`,
            videoDurationSec: 0,
            performDurationSec: 0,
          },
        ]);
      };
      xhr.onerror = () => {
        setUploadProgress((prev) => {
          const next = [...prev];
          next[idx] = 0;
          return next;
        });
      };
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    setPendingExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addExercise = async (index: number) => {
    const ex = pendingExercises[index];
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ex),
    });
    setPendingExercises((prev) => prev.filter((_, i) => i !== index));
    setSectionKey((k) => k + 1);
  };

  return (
    <AdminLayout>
      <button
        className="mb-4 px-3 py-2 text-sm bg-neutral-800 rounded-lg hover:bg-neutral-700"
        onClick={() => router.push(`/admin/categories/${categoryId}`)}
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Training: {training?.title}</h1>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-neutral-600 rounded-lg p-6 mb-6 text-center"
      >
        <p className="mb-2 text-sm text-gray-400">Drag & drop video here or choose files</p>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="text-sm"
        />
        {uploadProgress.map((p, i) => (
          <progress key={i} value={p} max="100" className="w-full mt-2">
            {p}%
          </progress>
        ))}
      </div>

      {pendingExercises.map((ex, idx) => (
        <div key={idx} className="bg-neutral-900 p-4 rounded-lg mb-4 space-y-2">
          {ex.videoUrl && (
            <video src={ex.videoUrl} controls className="w-full rounded mb-2" />
          )}
          <input
            value={ex.title}
            onChange={(e) => updateExercise(idx, 'title', e.target.value)}
            placeholder="title"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
          />
          <input
            value={ex.complexId}
            onChange={(e) => updateExercise(idx, 'complexId', e.target.value)}
            placeholder="complexId"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
          />
          <input
            type="number"
            value={ex.videoDurationSec}
            onChange={(e) => updateExercise(idx, 'videoDurationSec', Number(e.target.value))}
            placeholder="video duration sec"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
          />
          <input
            type="number"
            value={ex.performDurationSec}
            onChange={(e) => updateExercise(idx, 'performDurationSec', Number(e.target.value))}
            placeholder="perform duration sec"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
          />
          <button
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
            onClick={() => addExercise(idx)}
          >
            Add
          </button>
        </div>
      ))}

      <ExercisesSection key={sectionKey} />
    </AdminLayout>
  );
}
