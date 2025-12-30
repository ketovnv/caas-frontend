export function Holesky({width='2em', height='2em',props}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={width}
            height={height}
            {...props}
        >
            <g fill="none">
                <path fill="#8FFCF3" d="M12 2v7.39l6.25 2.795z"></path>
                <path fill="#CABCF8" d="M12 2L5.75 12.185L12 9.39z"></path>
                <path fill="#CBA7F5" d="M12 16.975V22l6.25-8.65z"></path>
                <path fill="#74A0F3" d="M12 22v-5.025L5.75 13.35z"></path>
                <path fill="#CBA7F5" d="m12 15.81l6.25-3.625L12 9.39z"></path>
                <path fill="#74A0F3" d="M5.75 12.185L12 15.81V9.39z"></path>
                <path
                    fill="#202699"
                    fillRule="evenodd"
                    d="m12 15.81l-6.25-3.625L12 2l6.25 10.185zm-5.835-3.92L11.9 2.545V9.34zm-.085.255L11.9 9.56v5.96zM12.1 9.56v5.96l5.815-3.375zm0-.22l5.735 2.55L12.1 2.545z"
                    clipRule="evenodd"
                ></path>
                <path
                    fill="#202699"
                    fillRule="evenodd"
                    d="m12 16.895l-6.25-3.55L12 22l6.25-8.655zM6.45 13.97l5.45 3.1v4.45zm5.65 3.1v4.45l5.45-7.55z"
                    clipRule="evenodd"
                ></path>
            </g>
        </svg>
    )
}
