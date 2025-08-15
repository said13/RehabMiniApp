import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { ExercisesSection } from 'src/components/admin/ExercisesSection';
import type { Training } from 'src/types';

export default function TrainingExercisesPage() {
  const router = useRouter();
  const { categoryId, trainingId } = router.query as { categoryId?: string; trainingId?: string };
  const [training, setTraining] = useState<Training | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);

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
    const file = files[0];
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const { uploadUrl, assetId: id } = await res.json();
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        setProgress(100);
        setAssetId(id);
        resolve();
      };
      xhr.onerror = reject;
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push(`/admin/categories/${categoryId}`)}>Back</button>
      <h1>Training: {training?.title}</h1>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        style={{ border: '2px dashed #ccc', padding: 20, marginBottom: 20 }}
      >
        <p>Drag & drop video here or choose a file</p>
        <input type="file" accept="video/*" onChange={(e) => handleFiles(e.target.files)} />
        {progress !== null && (
          <progress value={progress} max="100">
            {progress}%
          </progress>
        )}
        {assetId && <p>Uploaded asset ID: {assetId}</p>}
      </div>
      <ExercisesSection />
    </AdminLayout>
  );
}
