import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { Training, Exercise, Complex } from 'src/types';

export default function TrainingExercisesPage() {
  const router = useRouter();
  const { categoryId, trainingId } = router.query as { categoryId?: string; trainingId?: string };
  const [training, setTraining] = useState<Training | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number[]>>({});
  type ExerciseForm = Omit<Exercise, 'id'> & { id?: string; useDuration: boolean };
  type ComplexInfo = Omit<Complex, 'trainingId'> & { id: string };
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
    setComplexesInfo(related);
    const eRes = await fetch('/api/exercises');
    const allExercises: Exercise[] = await eRes.json();
    const exRelated = allExercises.filter((ex) =>
      related.some((c) => c.id === ex.complexId)
    );
    setExercises(
      exRelated.map((ex) => ({ ...ex, useDuration: ex.performDurationSec > 0 }))
    );
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
      xhr.onload = async () => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          const arr = next[complexId] ? [...next[complexId]] : [];
          arr[idx] = 100;
          next[complexId] = arr;
          return next;
        });
        try {
          let info: any = null;
          for (let attempt = 0; attempt < 5; attempt++) {
            const infoRes = await fetch(`/api/upload?uploadId=${u.uploadId}`);
            if (infoRes.status === 200) {
              info = await infoRes.json();
              break;
            }
            await new Promise((r) => setTimeout(r, 1000));
          }
          if (info && info.assetId && info.playbackId) {
            try {
              const payload = {
                title: `Тренировка ${exercises.length + idx + 1}`,
                complexId,
                muxId: info.assetId,
                videoUrl: `https://stream.mux.com/${info.playbackId}.m3u8`,
                videoDurationSec: 10,
                performDurationSec: 10,
                repetitions: 1,
              };
              const exRes = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              const saved = await exRes.json();
              setExercises((prev) => [
                ...prev,
                { ...saved, useDuration: true },
              ]);
            } catch (e) {
              console.error('Failed to save exercise', e);
            }
          }
        } catch (err) {
          console.error('Failed to retrieve Mux playback ID', err);
        }
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

  const saveExercise = async (ex: ExerciseForm, index: number) => {
    const payload = {
      title: ex.title,
      complexId: ex.complexId,
      muxId: ex.muxId,
      videoUrl: ex.videoUrl,
      videoDurationSec: ex.videoDurationSec,
      performDurationSec: ex.useDuration ? ex.performDurationSec : 0,
      repetitions: ex.useDuration ? 0 : ex.repetitions ?? 1,
      restSec: ex.restSec,
      notes: ex.notes,
    };
    if (ex.id) {
      await fetch(`/api/exercises/${ex.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setExercises((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], id: data.id };
        return next;
      });
    }
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      saveExercise(next[index], index);
      return next;
    });
  };

  const startNewComplex = async () => {
    const res = await fetch('/api/complexes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainingId,
        order: complexesInfo.length + 1,
        rounds: 1,
      }),
    });
    const data = await res.json();
    setComplexesInfo((prev) => [...prev, { id: data.id, order: data.order, rounds: data.rounds }]);
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
        saveExercise(next[Number(idx)], Number(idx));
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
      await fetch(`/api/upload?assetId=${ex.muxId}`, { method: 'DELETE' });
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteComplex = async (complex: ComplexInfo) => {
    await fetch(`/api/complexes/${complex.id}`, { method: 'DELETE' });
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
                        <div className="flex gap-2">
                          <button
                            className={`px-2 py-1 rounded ${!ex.useDuration ? 'bg-blue-600' : 'bg-neutral-800'}`}
                            onClick={() => updateExercise(idx, 'useDuration', false)}
                          >
                            <i className="fa-solid fa-repeat" />
                          </button>
                          <button
                            className={`px-2 py-1 rounded ${ex.useDuration ? 'bg-blue-600' : 'bg-neutral-800'}`}
                            onClick={() => updateExercise(idx, 'useDuration', true)}
                          >
                            <i className="fa-solid fa-clock" />
                          </button>
                        </div>
                        {ex.useDuration ? (
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
                            placeholder="duration sec"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                          />
                        ) : (
                          <input
                            type="number"
                            value={ex.repetitions ?? 1}
                            onChange={(e) =>
                              updateExercise(
                                idx,
                                'repetitions',
                                Number(e.target.value)
                              )
                            }
                            placeholder="repetitions"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                          />
                        )}
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
    </AdminLayout>
  );
}
