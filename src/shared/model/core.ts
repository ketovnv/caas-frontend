import {makeAutoObservable, runInAction} from "mobx";
import {raf} from "@react-spring/rafz";


export class CoreStore {

    // FPS tracking
    private frameCount = 0;
    private lastFpsUpdate = 0;
    private currentFps = 143;

    constructor() {
        makeAutoObservable(this);
        this.startFpsTracking();
    }

    // Get metrics directly from rafz
    get fps() {
        return this.currentFps;
    }

    get currentTime() {
        return raf.now();
    }

    private startFpsTracking() {
        const loop = () => {
            const now = raf.now();
            this.frameCount++;

            if (now - this.lastFpsUpdate >= 1000) {
                const currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));

                // Обновляем Observable только раз в секунду
                runInAction(() => {
                    this.currentFps = currentFps;
                });

                this.lastFpsUpdate = now;
                this.frameCount = 0;
            }

            // Возвращаем true, чтобы rafz держал подписку активной
            return true;
        };

        // Регистрируем один раз
        raf.onFrame(loop);
    }
}

// Экспорт для прямого использования
export const core = new CoreStore();
