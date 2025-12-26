import {observer} from 'mobx-react-lite';
import {core} from 'shared/model/core';

export const FPSMonitor = observer(() => {

    return (
        <div
            style={{
                position: "fixed",
                top: 100,
                right: 10,
                zIndex: 9999, // Добавил z-index, чтобы не перекрывалось контентом
                background: "rgba(0,0,0,0.8)",
                color: "#3388FF",
                padding: "10px",
                borderRadius: "8px",
                fontFamily: "monospace",
                pointerEvents: "none", // Чтобы клики проходили сквозь него
                backdropFilter: "blur(4px)"
            }}
        >
            <div style={{fontWeight: 'bold'}}>Monitor: {core.fps} FPS</div>

            {/* Немного улучшил читаемость условий */}
            <div style={{
                color: core.fps > 90 ? "#1FB" : "#F54",
                fontSize: "0.8em",
                marginTop: "4px"
            }}>
                {core.fps < 90 ? "⚠️ Lagging" : "✅ Smooth"}
            </div>
        </div>
    );
});