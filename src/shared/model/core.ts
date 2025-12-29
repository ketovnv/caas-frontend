import {makeAutoObservable, runInAction} from "mobx";
import {raf} from "@react-spring/rafz";
import { SpringValue } from "@react-spring/web";

// ============================================================================
// Types
// ============================================================================

type FrameCallback = () => void;
type ThrottledUpdater<T> = (value: T) => void;

// ============================================================================
// CoreStore - Central animation loop and synchronization
// ============================================================================

export class CoreStore {

    // FPS tracking
    private frameCount = 0;
    private lastFpsUpdate = 0;

    // Scheduled callbacks (run once per frame, then cleared)
    private scheduledWrites: Set<FrameCallback> = new Set();
    private scheduledReads: Set<FrameCallback> = new Set();

    // Persistent frame subscribers (run every frame until unsubscribed)
    private frameSubscribers: Set<FrameCallback> = new Set();

    fpsSpring = new SpringValue(143, {
        config: { tension: 200, friction: 60, mass: 5 }
    });

    constructor() {
        makeAutoObservable<this, 'scheduledWrites' | 'scheduledReads' | 'frameSubscribers' | 'frameCount' | 'lastFpsUpdate'>(this, {
            scheduledWrites: false,
            scheduledReads: false,
            frameSubscribers: false,
            frameCount: false,
            lastFpsUpdate: false,
        });
        this.startMainLoop();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────────────────────────────────

    get fps() {
        return this.fpsSpring;
    }

    get currentTime() {
        return raf.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scheduling API - синхронизация с центральной петлёй
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Schedule a DOM write operation (style updates, etc.)
     * Runs in the write phase of the frame, batched with React Spring animations
     */
    scheduleWrite(callback: FrameCallback): void {
        this.scheduledWrites.add(callback);
    }

    /**
     * Schedule a DOM read operation (getBoundingClientRect, etc.)
     * Runs before writes to avoid layout thrashing
     */
    scheduleRead(callback: FrameCallback): void {
        this.scheduledReads.add(callback);
    }

    /**
     * Create a throttled updater that coalesces multiple calls into one per frame
     * Useful for mouse move, scroll, resize handlers
     */
    createThrottledUpdater<T>(handler: (value: T) => void): ThrottledUpdater<T> {
        let pending: T | undefined;
        let scheduled = false;

        return (value: T) => {
            pending = value;
            if (scheduled) return;
            scheduled = true;

            this.scheduleWrite(() => {
                scheduled = false;
                if (pending !== undefined) {
                    handler(pending);
                }
            });
        };
    }

    /**
     * Subscribe to every frame (for continuous animations)
     * Returns unsubscribe function
     */
    onFrame(callback: FrameCallback): () => void {
        this.frameSubscribers.add(callback);
        return () => this.frameSubscribers.delete(callback);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main Loop
    // ─────────────────────────────────────────────────────────────────────────

    private startMainLoop() {
        const loop = () => {
            const now = raf.now();
            this.frameCount++;

            // Execute persistent frame subscribers (continuous animations)
            for (const callback of this.frameSubscribers) {
                callback();
            }

            // Execute scheduled reads first (avoid layout thrashing)
            if (this.scheduledReads.size > 0) {
                for (const callback of this.scheduledReads) {
                    callback();
                }
                this.scheduledReads.clear();
            }

            // Execute scheduled writes
            if (this.scheduledWrites.size > 0) {
                for (const callback of this.scheduledWrites) {
                    callback();
                }
                this.scheduledWrites.clear();
            }

            // FPS update (once per second)
            if (now - this.lastFpsUpdate >= 1000) {
                const currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));

                runInAction(() => {
                    this.fpsSpring.start(currentFps);
                });

                this.lastFpsUpdate = now;
                this.frameCount = 0;
            }

            return true; // Keep loop alive
        };

        raf.onFrame(loop);
    }
}

// Экспорт для прямого использования
export const core = new CoreStore();
