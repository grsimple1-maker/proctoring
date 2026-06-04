import { initFaceDetector, detectFaces } from './faceDetector';

export class ProctoringEngine {
  constructor({ videoElement, onViolation }) {
    this.videoElement = videoElement;
    this.onViolation = onViolation;
    this.stream = null;
    this.intervalId = null;
    this.noFaceSinceMs = null; // время с момента пропажи лица
    this.lastViolationType = null;
    this.lastViolationTime = 0;
  }

  _emit(type, reason) {
    // Защита от дублирования нарушений с интервалом < 10 сек
    const now = Date.now();
    if (this.lastViolationType === type && now - this.lastViolationTime < 10000) return;
    this.lastViolationType = type;
    this.lastViolationTime = now;
    this.onViolation?.({ type, reason, timestamp: new Date().toISOString() });
  }

  async start() {
    // 1. Запрос доступа к камере через WebRTC
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Отслеживание принудительного отключения камеры
      this.stream.getVideoTracks().forEach(track => {
        track.onended = () => this._emit('camera_off', 'Камера отключена или закрыта');
      });
    } catch (e) {
      this._emit('camera_off', 'Не удалось получить доступ к камере');
      return;
    }

    // 2. Инициализация AI-модели
    await initFaceDetector();

    // 3. Цикл анализа кадров (каждые 2 секунды)
    this.intervalId = setInterval(() => this._tick(), 2000);

    // 4. События браузера
    document.addEventListener('visibilitychange', this._onVisibility);
    window.addEventListener('blur', this._onBlur);
  }

  _onVisibility = () => {
    if (document.hidden) this._emit('tab_switch', 'Переключение на другую вкладку');
  };

  _onBlur = () => {
    this._emit('window_blur', 'Открыто другое приложение или окно');
  };

  async _tick() {
    const faces = await detectFaces(this.videoElement);
    const now = Date.now();

    if (faces.length === 0) {
      if (!this.noFaceSinceMs) this.noFaceSinceMs = now;
      // Нарушение, если лицо отсутствует более 5 секунд
      if (now - this.noFaceSinceMs > 5000) {
        this._emit('no_face', 'Лицо отсутствует в кадре');
        this.noFaceSinceMs = now; // сброс таймера для следующей фиксации
      }
    } else {
      this.noFaceSinceMs = null;
      if (faces.length >= 2) {
        this._emit('multiple_faces', `В кадре обнаружено ${faces.length} человек`);
      }
    }
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    document.removeEventListener('visibilitychange', this._onVisibility);
    window.removeEventListener('blur', this._onBlur);
  }
}
