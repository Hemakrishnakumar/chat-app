import type { ReactNode } from "react";
import { Toaster } from "sonner";



type Props = {
    children: ReactNode
}

export default function ToastProvider({ children }: Props) {
    return (
        <>
            {children}
            <Toaster position="top-right" richColors={false} />
        </>
    );
}