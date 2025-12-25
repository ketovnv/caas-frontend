// stores/ThemeStore.ts
import {action, makeAutoObservable, reaction} from "mobx";
import {gradient,ControllerAPI,createControllerAPI} from "shared/lib/gradient";
export type OklchColor = [number, number, number];
const DARK = 0;
const LIGHT = 1;

const ultraSpringTheme = {
    tension: 50,
    friction: 75,
    mass: 5,
    precision: 0.1,
};

// ThemeToggle animation configs
const toggleAnimationConfig = {
    path: {tension: 280, friction: 60, mass: 0.8},
    switch: {tension: 300, friction: 30},
    background: {tension: 200, friction: 25},
    glow: {tension: 200, friction: 25},
};

export class ThemeStore {
    themeController = {} as ControllerAPI;
    colorScheme = DARK;
    disposers: Array<() => void> = [];
    isDisposed = false;

    // ThemeToggle controllers
    pathController = {} as ControllerAPI;
    switchController = {} as ControllerAPI;
    backgroundController = {} as ControllerAPI;
    glowController = {} as ControllerAPI;

    constructor(initialState?: any) {
        makeAutoObservable(this, {
            toggleColorScheme: action,
            switchTheme: action,
            updateToggleAnimations: action,
        });

        this.colorScheme = initialState.colorScheme ?? DARK;

        this.setThemeController();
        this.setToggleControllers();
        this.setupReactions();

    }

    get animatedTheme() {
        return this.themeController?.springs ?? this._getTheme;
    }

    get themeIsDark() {
        return this.colorScheme === DARK;
    }

    get _getTheme() {
        return gradient.getStandardTheme(this.themeIsDark);
    }

    // ThemeToggle animations
    get toggleAnimations() {
        return {
            path: this.pathController?.springs ?? {},
            switch: this.switchController?.springs ?? {},
            background: this.backgroundController?.springs ?? {},
            glow: this.glowController?.springs ?? {},
        };
    }

    setThemeController = () => {
        try {
            this.themeController = createController(
                "themeController",
                {...this._getTheme},
                {config: ultraSpringTheme},
            );
            console.log(
                "🎨 ThemeStore initialized with",
                this.themeIsDark ? "DARK" : "LIGHT",
                "theme",
            );
        } catch (error) {
            console.error("Failed to create theme controller:", error);
            this.themeController.dispose();
        }
    };

    setToggleControllers = () => {
        try {
            // Path animation (sun/moon morphing)
            this.pathController = this.core.createController(
                "themeTogglePath",
                {
                    sunOpacity: this.themeIsDark ? 0 : 1,
                    moonOpacity: this.themeIsDark ? 1 : 0,
                    sunScale: this.themeIsDark ? 0.5 : 1,
                    moonScale: this.themeIsDark ? 1 : 0.5,
                    sunRotate: this.themeIsDark ? -180 : 0,
                    moonRotate: this.themeIsDark ? 0 : 180,
                },
                {config: toggleAnimationConfig.path},
            );

            // Switch position (slider movement)
            this.switchController = this.core.createController(
                "themeToggleSwitch",
                {
                    x: this.themeIsDark ? 0 : 28, // Default md size
                },
                {config: toggleAnimationConfig.switch},
            );

            // Background gradient
            this.backgroundController = this.core.createController(
                "themeToggleBackground",
                {
                    backgroundColor: this.themeIsDark ? "#1e293b" : "#fbbf24",
                },
                {config: toggleAnimationConfig.background},
            );

            // Glow effect
            this.glowController = this.core.createController(
                "themeToggleGlow",
                {
                    glowIntensity: this.themeIsDark ? 0.4 : 0.6,
                },
                {config: toggleAnimationConfig.glow},
            );

            console.log("✨ ThemeToggle controllers initialized");
        } catch (error) {
            console.error("Failed to create toggle controllers:", error);
        }
    };

    toggleColorScheme = () => {
        console.log(this.colorScheme === DARK ? "🌙 → ☀️" : "☀️ → 🌙");
        this.colorScheme = !this.themeIsDark ? DARK : LIGHT;
    };

    setupReactions() {
        // Theme reaction
        const themeDispose = reaction(
            () => [this.colorScheme],
            () => {
                this.switchTheme();
                this.updateToggleAnimations();
            },
            {fireImmediately: true},
        );

        this.disposers.push(themeDispose);
    }

    switchTheme = () => {
        if (this.themeController?.springs?.color) {
            this.themeController?.start(this._getTheme, ultraSpringTheme);
        }
    };

    updateToggleAnimations = () => {
        // Update path controller
        this.pathController?.to({
            sunOpacity: this.themeIsDark ? 0 : 1,
            moonOpacity: this.themeIsDark ? 1 : 0,
            sunScale: this.themeIsDark ? 0.5 : 1,
            moonScale: this.themeIsDark ? 1 : 0.5,
            sunRotate: this.themeIsDark ? -180 : 0,
            moonRotate: this.themeIsDark ? 0 : 180,
        });

        // Update switch controller
        this.switchController?.to({
            x: this.themeIsDark ? 0 : 28,
        });

        // Update background controller
        this.backgroundController?.to({
            backgroundColor: this.themeIsDark ? "#1e293b" : "#fbbf24",
        });

        // Update glow controller
        this.glowController?.to({
            glowIntensity: this.themeIsDark ? 0.4 : 0.6,
        });
    };

    setSwitchSize = (size: "sm" | "md" | "lg") => {
        const offsets = {sm: 24, md: 28, lg: 32};
        this.switchController?.to({
            x: this.themeIsDark ? 0 : offsets[size],
        });
    };
}
