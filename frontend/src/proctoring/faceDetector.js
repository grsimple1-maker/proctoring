import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';

let detector = null;

// Инициализация модели обнаружения лиц (один раз на сессию)
export async function initFaceDetector() {
  if (detector) return detector;
  await tf.setBackend('webgl');
  await tf.ready();

  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  detector = await faceDetection.createDetector(model, {
    runtime: 'tfjs',
    modelType: 'short',
    maxFaces: 5,
  });
  return detector;
}

// Возвращает массив обнаруженных лиц для текущего кадра видео
export async function detectFaces(videoElement) {
  if (!detector || !videoElement || videoElement.readyState < 2) return [];
  try {
    const faces = await detector.estimateFaces(videoElement, { flipHorizontal: false });
    return faces;
  } catch (e) {
    console.error('Ошибка распознавания:', e);
    return [];
  }
}
