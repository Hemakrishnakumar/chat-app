import React from "react";



type SkeletonVariant = "line" | "block" | "avatar" | "card";

interface SkeletonProps {
    variant?: SkeletonVariant;
    width?: string | number;
    height?: string | number;
    className?: string;
}

const Skeleton = ({
    variant = "line",
    width,
    height,
    className = "",
}: SkeletonProps) => {
    const style: React.CSSProperties = {};

    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`skeleton skeleton-${variant} ${className}`}
            style={style}
            aria-busy="true"
            aria-live="polite"
        />
    );
};

export default Skeleton;