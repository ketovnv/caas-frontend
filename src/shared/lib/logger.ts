// logger.ts

// ============================================
// 🔧 Types
// ============================================
type LogLevel = "info" | "success" | "warning" | "error" | "debug" | "system";

interface LogStyle {
	base: string;
	light: string;
	dark: string;
}

interface LogOptions {
	colors?: [string, string];
	fontSize?: number;
	fontWeight?: string;
	timestamp?: boolean;
}

// ============================================
// 🎨 Styles
// ============================================
const LOG_STYLES: Record<LogLevel, LogStyle> = {
	info: {
		base: "#317FF3",
		light: "#74B5F6",
		dark: "#1036A2",
	},
	success: {
		base: "#31B257",
		light: "#81FF84",
		dark: "#115222",
	},
	warning: {
		base: "#FFC107",
		light: "#FFD54F",
		dark: "#FFA000",
	},
	error: {
		base: "#F44336",
		light: "#E57373",
		dark: "#D32F2F",
	},
	debug: {
		base: "#9C27B0",
		light: "#D868E8",
		dark: "#5B1F72",
	},
	system: {
		base: "#607D8B",
		light: "#90A4AE",
		dark: "#344A54",
	},
};

// ============================================
// 🛠 Utils
// ============================================
const isDev = process.env.NODE_ENV === "development";
const isSSR = typeof window === "undefined";

const formatTime = (): string => {
	const now = new Date();
	return now.toLocaleTimeString("ru-RU", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: { r: 255, g: 255, b: 255 };
};

const _lerpColor = (color1: string, color2: string, t: number): string => {
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);

	const r = Math.round(c1.r + (c2.r - c1.r) * t);
	const g = Math.round(c1.g + (c2.g - c1.g) * t);
	const b = Math.round(c1.b + (c2.b - c1.b) * t);

	return `rgb(${r},${g},${b})`;
};

// ============================================
// 🎨 Core Logger
// ============================================
class Logger {
	private enabled: boolean;
	private breadcrumbs: Array<{
		time: string;
		message: string;
		level: LogLevel;
	}> = [];
	private maxBreadcrumbs = 50;
	private performanceMarks = new Map<string, number>();

	constructor(enabled = isDev) {
		this.enabled = enabled;
	}

	// ============================================
	info(message: string, data?: unknown, options?: LogOptions): void {
		this.log("info", message, data, options);
	}

	success(message: string, data?: unknown, options?: LogOptions): void {
		this.log("success", message, data, options);
	}

	warning(message: string, data?: unknown, options?: LogOptions): void {
		this.log("warning", message, data, options);
	}

	// ============================================
	// 📝 Public Methods

	error(message: string, data?: unknown, options?: LogOptions): void {
		this.log("error", message, data, options);
	}

	debug(message: string, data?: unknown, options?: LogOptions): void {
		this.log("debug", message, data, options);
	}

	system(message: string, data?: unknown, options?: LogOptions): void {
		this.log("system", message, data, options);
	}

	// ============================================
	gLog(message: string, data?: unknown, options: LogOptions = {}): void {

		const {
			colors = ["#55AA80", "#7999ca"],
			fontSize = 16,
			fontWeight = "bold",
		} = options;

	
		const gradientStyle =
			`background: linear-gradient(to right, ${colors[0]}, ${colors[1]});` +
			`-webkit-background-clip: text;` +
			`-webkit-text-fill-color: transparent;` +
			`font-size: ${fontSize}px;` +
			`font-weight: ${fontWeight};`;

		const dataStr = this.formatData(data);
		const dataStyle = `color: ${colors[1]}; font-size: ${fontSize}px;`;

		console.log(
			`%c${message}%c${dataStr ? ` : ${dataStr}` : ""}`,
			gradientStyle,
			dataStyle,
		);
	}

	// ============================================
	json(label: string, data: Record<string, unknown>): void {
		if (!this.enabled) return;

		console.group(`📦 ${label}`);
		console.table(data); // ← Используй table!
		console.groupEnd();
	}

	// ============================================
	random(message: string, data?: unknown, options?: LogOptions): void {
		if (!this.enabled) return;

		const randomColor = () =>
			"#" +
			Math.floor(Math.random() * 16777215)
				.toString(16)
				.padStart(6, "0");

		const msgStyle = `color: ${randomColor()}; font-size: ${options?.fontSize || 14}px; font-weight: bold;`;
		const dataStyle = `color: ${randomColor()}; font-size: ${options?.fontSize || 14}px; font-weight: bold;`;

		const dataStr = this.formatData(data);
		console.log(
			`%c${message}%c${dataStr ? `: ${dataStr}` : ""}`,
			msgStyle,
			dataStyle,
		);
	}

	// ============================================
	// 🎨 Gradient (только для браузера)

	// ============================================
	group(title: string, collapsed = false): void {
		if (!this.enabled) return;
		collapsed ? console.groupCollapsed(title) : console.group(title);
	}

	// ============================================
	// 📊 JSON Logger

	groupEnd(): void {
		if (!this.enabled) return;
		console.groupEnd();
	}

	// ============================================
	// 🎲 Random Colors

	// ============================================
	time(label: string): void {
		if (!this.enabled) return;
		console.time(label);
	}

	// ============================================
	// 🎯 Group Logging

	timeEnd(label: string): void {
		if (!this.enabled) return;
		console.timeEnd(label);
	}

	// ============================================
	enable(): void {
		this.enabled = true;
	}

	// ============================================
	// ⏱ Performance

	disable(): void {
		this.enabled = false;
	}

	rainbow(message: string, data?: unknown): void {
		if (!this.enabled || isSSR) return;

		const colors = [
			"#FF0000",
			"#FF7F00",
			"#FFFF00",
			"#00FF00",
			"#0000FF",
			"#4B0082",
			"#9400D3",
		];
		const letters = message.split("");

		const styles = letters.map((_, i) => {
			const colorIndex = Math.floor((i / letters.length) * colors.length);
			return `color: ${colors[colorIndex]}; font-weight: bold; font-size: 16px;`;
		});

		const formatted = `${letters.map(() => "%c").join("")}%c`;
		const args = letters.flatMap((char, i) => [char, styles[i]]);

		const dataStr = this.formatData(data);
		args.push(dataStr ? ` : ${dataStr}` : "", "color: gray;");

		console.log(formatted, ...args);
	}

	// ============================================
	// 🔧 Control

	// ============================================
	capture(label: string, element: HTMLElement): void {
		if (!this.enabled || isSSR) return;

		console.log(`📸 ${label}:`, {
			tag: element.tagName,
			classes: element.className,
			id: element.id,
			computed: window.getComputedStyle(element),
			bounds: element.getBoundingClientRect(),
		});
	}

	private log(
		level: LogLevel,
		message: string,
		data?: unknown,
		options: LogOptions = {},
	): void {
		if (!this.enabled) return;

		const { fontSize = 14, timestamp = true } = options;

		const style = LOG_STYLES[level];
		const time = timestamp ? formatTime() : "";

		// Форматируем data
		const dataStr = this.formatData(data);

		// Временная метка
		const timeStyle = this.getTimeStyle();

		// Основное сообщение
		const msgStyle = `color: ${style.base}; font-size: ${fontSize}px; font-weight: bold;`;
		const dataStyle = `color: ${style.light}; font-size: ${fontSize}px; font-weight: bold;`;

		if (timestamp) {
			console.log(
				`%c${time} %c${message}%c${dataStr ? `: ${dataStr}` : ""}`,
				timeStyle,
				msgStyle,
				dataStyle,
			);
		} else {
			console.log(
				`%c${message}%c${dataStr ? `: ${dataStr}` : ""}`,
				msgStyle,
				dataStyle,
			);
		}
	}

	private formatData(data: unknown): string {
		if (data === undefined || data === null) return "";

		if (typeof data === "string") return data;

		if (typeof data === "object") {
			try {
				return JSON.stringify(data, null, 2);
			} catch {
				return String(data);
			}
		}

		return String(data);
	}

	// ============================================
	// 📸 Screenshot (для дебага)

	private getTimeStyle(): string {
		const rgB = Math.floor(Math.random() * 75);
		return (
			`background: linear-gradient(#CCFF${rgB + 20}, #7799${rgB});` +
			`padding: 2px; margin-right: 5px; color: #1122${rgB};` +
			`font-size: 9px; font-weight: bold;`
		);
	}

	diff(label: string, before: any, after: any): void {
		if (!this.enabled) return;

		console.group(`🔄 ${label}`);

		const changes = this.getObjectDiff(before, after);

		if (changes.added.length > 0) {
			console.log("%c➕ Added:", "color: #4CAF50; font-weight: bold;");
			console.table(changes.added);
		}

		if (changes.removed.length > 0) {
			console.log("%c➖ Removed:", "color: #F44336; font-weight: bold;");
			console.table(changes.removed);
		}

		if (changes.modified.length > 0) {
			console.log("%c🔧 Modified:", "color: #FF9800; font-weight: bold;");
			console.table(changes.modified);
		}

		if (
			changes.added.length === 0 &&
			changes.removed.length === 0 &&
			changes.modified.length === 0
		) {
			console.log("%c✨ No changes detected", "color: #9E9E9E;");
		}

		console.groupEnd();
	}

	private getObjectDiff(before: any, after: any) {
		const added: Array<{ key: string; value: any }> = [];
		const removed: Array<{ key: string; value: any }> = [];
		const modified: Array<{ key: string; before: any; after: any }> = [];

		// Проверяем добавленные и измененные
		for (const key in after) {
			if (!(key in before)) {
				added.push({ key, value: after[key] });
			} else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
				modified.push({ key, before: before[key], after: after[key] });
			}
		}

		// Проверяем удаленные
		for (const key in before) {
			if (!(key in after)) {
				removed.push({ key, value: before[key] });
			}
		}

		return { added, removed, modified };
	}

	// ============================================
	// 🍞 Breadcrumbs - цепочка событий
	// ============================================
	breadcrumb(message: string, level: LogLevel = "info"): void {
		if (!this.enabled) return;

		const crumb = {
			time: formatTime(),
			message,
			level,
		};

		this.breadcrumbs.push(crumb);

		// Ограничиваем количество
		if (this.breadcrumbs.length > this.maxBreadcrumbs) {
			this.breadcrumbs.shift();
		}
	}

	showBreadcrumbs(): void {
		if (!this.enabled) return;

		console.group("🍞 Breadcrumbs Trail");
		console.table(this.breadcrumbs);
		console.groupEnd();
	}

	clearBreadcrumbs(): void {
		this.breadcrumbs = [];
	}

	// ============================================
	// 🌐 Network - логирование API запросов
	// ============================================
	async networkRequest(
		method: string,
		url: string,
		options?: RequestInit,
	): Promise<Response> {
		if (!this.enabled) {
			return fetch(url, { ...options, method });
		}

		const requestId = Math.random().toString(36).substr(2, 9);
		const startTime = performance.now();

		console.group(`🌐 ${method.toUpperCase()} ${url}`);
		console.log("%cRequest ID:", "color: #9E9E9E;", requestId);

		if (options?.body) {
			console.log("%cBody:", "color: #2196F3; font-weight: bold;");
			try {
				console.log(JSON.parse(options.body as string));
			} catch {
				console.log(options.body);
			}
		}

		if (options?.headers) {
			console.log("%cHeaders:", "color: #2196F3; font-weight: bold;");
			console.table(options.headers);
		}

		try {
			const response = await fetch(url, { ...options, method });
			const duration = performance.now() - startTime;

			const statusColor = response.ok ? "#4CAF50" : "#F44336";
			console.log(
				`%c${response.status} ${response.statusText}`,
				`color: ${statusColor}; font-weight: bold; font-size: 14px;`,
			);
			console.log("%cDuration:", "color: #FF9800;", `${duration.toFixed(2)}ms`);

			// Клонируем response чтобы прочитать body
			const clonedResponse = response.clone();
			try {
				const data = await clonedResponse.json();
				console.log("%cResponse:", "color: #4CAF50; font-weight: bold;");
				console.log(data);
			} catch {
				console.log("%cResponse: (not JSON)", "color: #9E9E9E;");
			}

			console.groupEnd();

			return response;
		} catch (error) {
			const duration = performance.now() - startTime;
			console.log("%cError:", "color: #F44336; font-weight: bold;");
			console.error(error);
			console.log("%cDuration:", "color: #FF9800;", `${duration.toFixed(2)}ms`);
			console.groupEnd();
			throw error;
		}
	}

	// ============================================
	// ⚡️ Performance - детальное профилирование
	// ============================================
	measure(label: string): () => void {
		if (!this.enabled) return () => {};

		const startTime = performance.now();
		const startMark = `${label}-start`;

		if (typeof performance.mark === "function") {
			performance.mark(startMark);
		}

		this.performanceMarks.set(label, startTime);

		// Возвращаем функцию для остановки
		return () => {
			const duration = performance.now() - startTime;
			const endMark = `${label}-end`;

			if (typeof performance.mark === "function") {
				performance.mark(endMark);
				performance.measure(label, startMark, endMark);
			}

			this.performanceMarks.delete(label);

			// Цветовая индикация по скорости
			let color = "#4CAF50"; // быстро
			if (duration > 100) color = "#FF9800"; // средне
			if (duration > 500) color = "#F44336"; // медленно

			console.log(
				`%c⚡️ ${label}`,
				`color: ${color}; font-weight: bold;`,
				`${duration.toFixed(2)}ms`,
			);
		};
	}

	showPerformance(): void {
		if (!this.enabled) return;

		const entries = performance.getEntriesByType("measure");

		if (entries.length === 0) {
			console.log("%cNo performance measures recorded", "color: #9E9E9E;");
			return;
		}

		console.group("⚡️ Performance Measures");
		console.table(
			entries.map((entry) => ({
				name: entry.name,
				duration: `${entry.duration.toFixed(2)}ms`,
				startTime: `${entry.startTime.toFixed(2)}ms`,
			})),
		);
		console.groupEnd();
	}

	clearPerformance(): void {
		if (typeof performance.clearMarks === "function") {
			performance.clearMarks();
			performance.clearMeasures();
		}
		this.performanceMarks.clear();
	}

	// ============================================
	// 🎨 Component - логирование React компонента
	// ============================================
	component(
		name: string,
		props?: Record<string, any>,
		state?: Record<string, any>,
	): void {
		if (!this.enabled) return;

		console.group(`⚛️ ${name}`);

		if (props && Object.keys(props).length > 0) {
			console.log("%cProps:", "color: #61DAFB; font-weight: bold;");
			console.table(props);
		}

		if (state && Object.keys(state).length > 0) {
			console.log("%cState:", "color: #FF6B6B; font-weight: bold;");
			console.table(state);
		}

		console.groupEnd();
	}

	// ============================================
	// 🔍 Assert - проверки с логированием
	// ============================================
	assert(condition: boolean, message: string, data?: any): void {
		if (!this.enabled) return;

		if (!condition) {
			console.log(
				`%c❌ Assertion Failed: ${message}`,
				"color: #F44336; font-size: 14px; font-weight: bold;",
			);
			if (data !== undefined) {
				console.log("%cData:", "color: #FF9800;");
				console.log(data);
			}
			console.trace(); // Показываем stack trace
		}
	}

	// ============================================
	// 📦 Memory - отслеживание памяти
	// ============================================
	memory(label?: string): void {
		if (!this.enabled || isSSR) return;

		const memory = (performance as any).memory;

		if (!memory) {
			console.warn("Memory API not available");
			return;
		}

		const toMB = (bytes: number) => (bytes / 1048576).toFixed(2);

		console.log(
			`%c💾 ${label || "Memory"}`,
			"color: #9C27B0; font-weight: bold;",
			`\nUsed: ${toMB(memory.usedJSHeapSize)}MB` +
				`\nTotal: ${toMB(memory.totalJSHeapSize)}MB` +
				`\nLimit: ${toMB(memory.jsHeapSizeLimit)}MB`,
		);
	}

	// ============================================
	// 📸 Snapshot - сохранить состояние
	// ============================================
	snapshot(label: string, data: any): void {
		if (!this.enabled) return;

		const snapshot = {
			label,
			timestamp: new Date().toISOString(),
			data: JSON.parse(JSON.stringify(data)), // deep clone
		};

		// Сохраняем в localStorage
		try {
			const snapshots = JSON.parse(
				localStorage.getItem("logger-snapshots") || "[]",
			);
			snapshots.push(snapshot);
			localStorage.setItem("logger-snapshots", JSON.stringify(snapshots));

			console.log(
				`%c📸 Snapshot saved: ${label}`,
				"color: #4CAF50; font-weight: bold;",
			);
		} catch (error) {
			console.warn("Failed to save snapshot:", error);
		}
	}

	showSnapshots(): void {
		if (!this.enabled) return;

		try {
			const snapshots = JSON.parse(
				localStorage.getItem("logger-snapshots") || "[]",
			);

			if (snapshots.length === 0) {
				console.log("%cNo snapshots saved", "color: #9E9E9E;");
				return;
			}

			console.group("📸 Saved Snapshots");
			snapshots.forEach((snap: any, index: number) => {
				console.group(`${index + 1}. ${snap.label} (${snap.timestamp})`);
				console.log(snap.data);
				console.groupEnd();
			});
			console.groupEnd();
		} catch (error) {
			console.warn("Failed to load snapshots:", error);
		}
	}

	clearSnapshots(): void {
		localStorage.removeItem("logger-snapshots");
		console.log("%c📸 Snapshots cleared", "color: #4CAF50;");
	}

	// ============================================
	// 🎯 Trace - красивый stack trace
	// ============================================
	trace(message?: string): void {
		if (!this.enabled) return;

		if (message) {
			console.log(`%c🔍 ${message}`, "color: #2196F3; font-weight: bold;");
		}

		console.trace();
	}

	// ============================================
	// 🔥 Count - счетчик вызовов
	// ============================================
	private counters = new Map<string, number>();

	count(label: string): void {
		if (!this.enabled) return;

		const current = this.counters.get(label) || 0;
		const newCount = current + 1;
		this.counters.set(label, newCount);

		console.log(
			`%c🔢 ${label}:`,
			"color: #9C27B0; font-weight: bold;",
			newCount,
		);
	}

	countReset(label: string): void {
		this.counters.delete(label);
	}

	showCounts(): void {
		if (!this.enabled) return;

		if (this.counters.size === 0) {
			console.log("%cNo counters", "color: #9E9E9E;");
			return;
		}

		console.group("🔢 Counters");
		console.table(
			Array.from(this.counters.entries()).map(([label, count]) => ({
				label,
				count,
			})),
		);
		console.groupEnd();
	}

	// ============================================
	// 🎭 Condition - условное логирование
	// ============================================
	if(condition: boolean, level: LogLevel, message: string, data?: any): void {
		if (condition) {
			this.log(level, message, data);
		}
	}

	// ============================================
	// 🔄 Once - логировать только один раз
	// ============================================
	private onceLogs = new Set<string>();

	once(message: string, data?: any, level: LogLevel = "info"): void {
		if (!this.enabled) return;

		const key = `${level}:${message}`;

		if (!this.onceLogs.has(key)) {
			this.onceLogs.add(key);
			this.log(level, `[ONCE] ${message}`, data);
		}
	}

	clearOnce(): void {
		this.onceLogs.clear();
	}

	// ============================================
	// 🎨 Animation - дебаг анимаций
	// ============================================
	animation(
		name: string,
		details: {
			from?: any;
			to?: any;
			duration?: number;
			easing?: string;
			progress?: number;
		},
	): void {
		if (!this.enabled) return;

		console.group(`🎬 Animation: ${name}`);

		if (details.from !== undefined) {
			console.log("%cFrom:", "color: #FF9800;", details.from);
		}

		if (details.to !== undefined) {
			console.log("%cTo:", "color: #4CAF50;", details.to);
		}

		if (details.duration !== undefined) {
			console.log("%cDuration:", "color: #2196F3;", `${details.duration}ms`);
		}

		if (details.easing) {
			console.log("%cEasing:", "color: #9C27B0;", details.easing);
		}

		if (details.progress !== undefined) {
			const percent = (details.progress * 100).toFixed(1);
			const bar = "█".repeat(Math.round(details.progress * 20));
			console.log(
				`%cProgress: ${bar} ${percent}%`,
				"color: #00BCD4; font-family: monospace;",
			);
		}

		console.groupEnd();
	}

	// ============================================
	// 📊 Table - красивая таблица
	// ============================================
	table(data: any[] | Record<string, any>, columns?: string[]): void {
		if (!this.enabled) return;

		if (columns) {
			console.table(data, columns);
		} else {
			console.table(data);
		}
	}

	// ============================================
	// 🎯 Mark - визуальная метка в консоли
	// ============================================
	mark(message: string, emoji = "📍"): void {
		if (!this.enabled) return;

		const line = "═".repeat(50);
		console.log(
			`\n%c${line}\n${emoji} ${message}\n${line}`,
			"color: #FF6B6B; font-weight: bold; font-size: 14px;",
		);
	}

	// ============================================
	// 💾 Export - экспорт логов
	// ============================================
	exportLogs(): void {
		if (!this.enabled) return;

		const logs = {
			breadcrumbs: this.breadcrumbs,
			counters: Array.from(this.counters.entries()),
			performance: Array.from(this.performanceMarks.entries()),
			timestamp: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(logs, null, 2)], {
			type: "application/json",
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `logs-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);

		console.log("%c💾 Logs exported", "color: #4CAF50; font-weight: bold;");
	}

	// ============================================
	// 🎯 Clear All - очистить всё
	// ============================================
	clearAll(): void {
		console.clear();
		this.clearBreadcrumbs();
		this.clearPerformance();
		this.clearSnapshots();
		this.clearOnce();
		this.counters.clear();
		console.log("%c🧹 All logs cleared", "color: #4CAF50; font-weight: bold;");
	}
}

// ============================================
// 📤 Export
// ============================================
export const logger = new Logger();

// Convenience exports
export const {
	info,
	success,
	warning,
	error,
	debug,
	system,
	gLog,
	json,
	random,
	group,
	groupEnd,
	time,
	timeEnd,
} = logger;
