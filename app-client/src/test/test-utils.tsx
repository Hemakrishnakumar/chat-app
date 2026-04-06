/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';


// Add custom render function with providers if needed
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    return render(ui, { ...options });
}

export * from '@testing-library/react';
export { customRender as render };
