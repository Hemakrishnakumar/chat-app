type SpinnerSize = "sm" | "md" | "lg"
type SpinnerVariant = "inline" | "overlay" | "fullscreen"

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  variant?: SpinnerVariant
  center?: boolean
  className?: string
}

const Spinner = ({
    size = "md",
    color = "#2563eb",
    variant = "inline",
    center = false,
    className = "",
}: SpinnerProps) => {
    const spinner = (
        <svg
            className={`spinner spinner-${size} ${className}`}
            viewBox="0 0 50 50"
            style={{ color }}
            role="status"
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="spinner-path"
            />
        </svg>
    );

    if (variant === "fullscreen") {
        return <div className="spinner-fullscreen">{spinner}</div>;
    }

    if (variant === "overlay") {
        return <div className="spinner-overlay">{spinner}</div>;
    }

    if (center) {
        return <div className="spinner-center">{spinner}</div>;
    }

    return spinner;
};

export default Spinner;