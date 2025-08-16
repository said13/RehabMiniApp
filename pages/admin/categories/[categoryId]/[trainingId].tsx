import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { Training, Exercise, Complex } from 'src/types';

export default function TrainingExercisesPage() {
  const router = useRouter();
  const { categoryId, trainingId } = router.query as { categoryId?: string; trainingId?: string };
  const [training, setTraining] = useState<Training | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number[]>>({});
  type ExerciseForm = Omit<Exercise, 'id'> & { id?: string; isNew?: boolean };
  type ComplexInfo = Omit<Complex, 'trainingId'> & { id: string; isNew?: boolean };
  const createId = () => Math.random().toString(36).substring(2, 9);
  const [complexesInfo, setComplexesInfo] = useState<ComplexInfo[]>([]);
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!trainingId) return;
    fetchTraining();
    fetchComplexesAndExercises();
  }, [trainingId]);

  const fetchTraining = async () => {
    const res = await fetch(`/api/trainings/${trainingId}`);
    const data = await res.json();
    setTraining(data);
  };

  const fetchComplexesAndExercises = async () => {
    const cRes = await fetch('/api/complexes');
    const allComplexes: Complex[] = await cRes.json();
    const related = allComplexes.filter((c) => c.trainingId === trainingId);
    setComplexesInfo(related.map((c) => ({ ...c, isNew: false })));
    const eRes = await fetch('/api/exercises');
    const allExercises: Exercise[] = await eRes.json();
    const exRelated = allExercises.filter((ex) =>
      related.some((c) => c.id === ex.complexId)
    );
    setExercises(exRelated.map((ex) => ({ ...ex, isNew: false })));
  };

  const handleFiles = async (files: FileList | null, complexId: string) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    setUploadProgress((prev) => ({
      ...prev,
      [complexId]: new Array(fileArr.length).fill(0),
    }));
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
            const next = { ...prev };
            const arr = next[complexId] ? [...next[complexId]] : [];
            arr[idx] = Math.round((e.loaded / e.total) * 100);
            next[complexId] = arr;
            return next;
          });
        }
      };
      xhr.onload = () => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          const arr = next[complexId] ? [...next[complexId]] : [];
          arr[idx] = 100;
          next[complexId] = arr;
          return next;
        });
        setExercises((prev) => [
          ...prev,
          {
            id: createId(),
            isNew: true,
            title: '',
            complexId,
            muxId: u.assetId,
            videoUrl: `https://stream.mux.com/${u.assetId}.m3u8`,
            videoDurationSec: 0,
            performDurationSec: 0,
          },
        ]);
      };
      xhr.onerror = () => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          const arr = next[complexId] ? [...next[complexId]] : [];
          arr[idx] = 0;
          next[complexId] = arr;
          return next;
        });
      };
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const startNewComplex = () => {
    const newId = createId();
    setComplexesInfo((prev) => [
      ...prev,
      { id: newId, order: prev.length + 1, rounds: 1, isNew: true },
    ]);
  };

  const handleSave = async () => {
    if (
      exercises.some(
        (ex) =>
          !ex.title ||
          ex.videoDurationSec <= 0 ||
          ex.performDurationSec <= 0
      )
    ) {
      alert('Please fill in all fields for each exercise');
      return;
    }

    const complexIdMap: Record<string, string> = {};
    for (const info of complexesInfo) {
      if (info.isNew) {
        const res = await fetch('/api/complexes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainingId,
            order: info.order,
            rounds: info.rounds,
          }),
        });
        const data = await res.json();
        complexIdMap[info.id] = data.id;
      } else {
        complexIdMap[info.id] = info.id;
      }
    }

    for (const ex of exercises) {
      const { id, isNew, ...rest } = ex;
      const payload = { ...rest, complexId: complexIdMap[ex.complexId] };
      if (isNew) {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (id) {
        await fetch(`/api/exercises/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    }

    setExercises([]);
    router.push(`/admin/categories/${categoryId}`);
  };

  const handleExerciseDrop = (
    e: React.DragEvent<HTMLDivElement>,
    complexId: string
  ) => {
    e.preventDefault();
    const idx = e.dataTransfer.getData('text/plain');
    if (idx) {
      setExercises((prev) => {
        const next = [...prev];
        next[Number(idx)] = { ...next[Number(idx)], complexId };
        return next;
      });
    } else {
      handleFiles(e.dataTransfer.files, complexId);
    }
  };

  const deleteExercise = async (ex: ExerciseForm, index: number) => {
    if (ex.id) {
      await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
    } else if (ex.muxId) {
      await fetch(`/api/mux-assets/${ex.muxId}`, { method: 'DELETE' });
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteComplex = async (complex: ComplexInfo) => {
    if (complex.isNew) {
      const related = exercises.filter((ex) => ex.complexId === complex.id);
      for (const ex of related) {
        if (ex.id) {
          await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
        } else if (ex.muxId) {
          await fetch(`/api/mux-assets/${ex.muxId}`, { method: 'DELETE' });
        }
      }
    } else {
      await fetch(`/api/complexes/${complex.id}`, { method: 'DELETE' });
    }
    setExercises((prev) => prev.filter((ex) => ex.complexId !== complex.id));
    setComplexesInfo((prev) => prev.filter((c) => c.id !== complex.id));
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
      <button
        className="px-3 py-2 mb-4 text-sm bg-neutral-800 rounded-lg hover:bg-neutral-700"
        onClick={startNewComplex}
      >
        Add complex
      </button>
      <div className="space-y-6">
        {complexesInfo.map((complex, cIdx) => (
          <div key={complex.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">
                Complex #{cIdx + 1}
              </span>
              <button
                className="text-xs text-red-400"
                onClick={() => deleteComplex(complex)}
              >
                Delete complex
              </button>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleExerciseDrop(e, complex.id)}
              className="border-2 border-dashed border-neutral-600 rounded-lg p-4 text-center"
            >
              <p className="mb-2 text-sm text-gray-400">
                Drag & drop video or exercises here
              </p>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFiles(e.target.files, complex.id)}
                className="text-sm"
              />
              <div className="mt-4 flex flex-wrap gap-4 justify-start">
                {exercises.map(
                  (ex, idx) =>
                    ex.complexId === complex.id && (
                      <div
                        key={ex.id || idx}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData('text/plain', idx.toString())
                        }
                        className="bg-neutral-900 p-4 rounded-lg space-y-2 text-left w-60"
                      >
                        {ex.videoUrl && (
                          <video
                            src={ex.videoUrl}
                            controls
                            className="w-full rounded mb-2"
                          />
                        )}
                        <input
                          value={ex.title}
                          onChange={(e) =>
                            updateExercise(idx, 'title', e.target.value)
                          }
                          placeholder="title"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                        />
                        <input
                          type="number"
                          value={ex.videoDurationSec}
                          onChange={(e) =>
                            updateExercise(
                              idx,
                              'videoDurationSec',
                              Number(e.target.value)
                            )
                          }
                          placeholder="video duration sec"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                        />
                        <input
                          type="number"
                          value={ex.performDurationSec}
                          onChange={(e) =>
                            updateExercise(
                              idx,
                              'performDurationSec',
                              Number(e.target.value)
                            )
                          }
                          placeholder="perform duration sec"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                        />
                        <button
                          className="text-xs text-red-400"
                          onClick={() => deleteExercise(ex, idx)}
                        >
                          Delete
                        </button>
                      </div>
                    )
                )}
              </div>
              {uploadProgress[complex.id]?.map((p, i) => (
                <progress key={i} value={p} max="100" className="w-full mt-2">
                  {p}%
                </progress>
              ))}
            </div>
          </div>
        ))}
      </div>
      {exercises.length > 0 && (
        <button
          className="mt-6 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
          onClick={handleSave}
        >
          Save
        </button>
      )}
    </AdminLayout>
  );
}
