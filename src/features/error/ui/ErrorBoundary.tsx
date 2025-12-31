import {Component, ComponentType, ErrorInfo, FC, PropsWithChildren} from "react";
import {ShimmerButton} from "shared/ui";

// import {Button} from "@/components/ui/button.tsx";


interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error | undefined;
    errorId: string;
    retryCount: number;
    lastErrorTime: number;
}

interface ErrorBoundaryProps {
    fallback?: ComponentType<{
        error: Error;
        resetError: () => void;
        retryCount: number;
        canRetry: boolean;
    }>;
    onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
    maxRetries?: number;
    retryDelay?: number;
}

export class ErrorBoundary extends Component<
    PropsWithChildren<ErrorBoundaryProps>,
    ErrorBoundaryState
> {
    private retryTimer?: NodeJS.Timeout;
    private readonly maxRetries: number;
    private readonly retryDelay: number;

    constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
        super(props);
        this.maxRetries = props.maxRetries ?? 3;
        this.retryDelay = props.retryDelay ?? 2000;
        this.state = {
            hasError: false,
            errorId: '',
            retryCount: 0,
            lastErrorTime: 0
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        const errorId = new Date().toISOString();
        return {
            hasError: true,
            error,
            errorId,
            lastErrorTime: new Date().getTime()
        };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const errorId = this.state.errorId;
        console.error(`ErrorBoundary [${errorId}] caught error:`, {
            error,
            errorInfo,
            retryCount: this.state.retryCount,
            stack: errorInfo.componentStack
        });

        this.props.onError?.(error, errorInfo, errorId);
    }

    override componentWillUnmount() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
        }
    }

    resetError = () => {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
        }

        const now = new Date().getTime();
        const timeSinceLastError = now - this.state.lastErrorTime;

        this.setState(prevState => ({
            hasError: false,
            error: undefined,
            errorId: '',
            retryCount: timeSinceLastError > 30000 ? 0 : prevState.retryCount + 1,
            lastErrorTime: now
        }));
    };

    autoRetry = () => {
        if (this.state.retryCount < this.maxRetries) {
            this.retryTimer = setTimeout(() => {
                this.resetError();
            }, this.retryDelay);
        }
    };

    override render() {
        if (this.state.hasError && this.state.error) {
            const canRetry = this.state.retryCount < this.maxRetries;
            const Fallback = this.props.fallback || DefaultErrorFallback;

            if (canRetry && this.state.retryCount > 0) {
                this.autoRetry();
            }

            return (
                <Fallback
                    error={this.state.error}
                    resetError={this.resetError}
                    retryCount={this.state.retryCount}
                    canRetry={canRetry}
                />
            );
        }

        return this.props.children;
    }
}

export const DefaultErrorFallback: FC<{
    error: Error;
    resetError: () => void;
    retryCount: number;
    canRetry: boolean;
}> = ({ error, retryCount}) => (
    <div className="h-dvh flex p-16 justify-center items-start  bg-orange-400">
        <div className="bg-red-950 border border-red-500 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
                <div>
                    🚫
                    {/*<svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">*/}
                    {/*  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />*/}
                    {/*</svg>*/}
                </div>
                <div className="ml-3">
                    <h3 className="px-2 text-red-500 font-medium bg-red-100 rounded-2xl">
                        Произошла ошибка
                    </h3>
                </div>
            </div>

            <div className="mb-4">
                <div className="text-yellow-200 font-bold">
                    <details>
                        <summary className="cursor-pointer hover:text-cyan-400">
                            {error.message}
                        </summary>
                        <pre className="mt-2 text-yellow-200 bg-red-800 p-2 rounded">
                            {error.stack}
                        </pre>
                    </details>
                </div>
            </div>

            {retryCount > 0 && (
                <div className="mb-4 text-xs text-red-600">
                    Попытка {retryCount} из 3
                </div>
            )}

            <div className="flex space-x-2 justify-end">
                {/*<ShimmerButton*/}
                {/*    onClick={resetError}*/}
                {/*    disabled={!canRetry}*/}
                {/*    background = "linear-gradient(135deg, #FF9900 0%, #552200 100%)"*/}
                {/*>*/}
                {/*  {canRetry ? 'Ещё раз' : 'Слишком много попыток'}*/}
                {/*</ShimmerButton>*/}
                <ShimmerButton
                    shimmerColor = "#BBAA00"
                    background="linear-gradient(135deg, #FFCC00 0%, #331100 100%)"
                    onClick={() => window.location.reload()}
                >
                    Перезагрузить
                </ShimmerButton>
            </div>
        </div>
    </div>
);