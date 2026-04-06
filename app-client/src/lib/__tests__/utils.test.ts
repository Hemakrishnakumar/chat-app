import { cn } from '../utils';



describe('cn utility', () => {
    it('should merge class names correctly', () => {
        const result = cn('px-4', 'py-2');
        expect(result).toBe('px-4 py-2');
    });

    it('should handle conditional classes', () => {
        const isHidden = false;
        const result = cn('base-class', isHidden && 'hidden', 'visible');
        expect(result).toBe('base-class visible');
    });

    it('should merge conflicting Tailwind classes', () => {
        const result = cn('px-2', 'px-4');
        expect(result).toBe('px-4');
    });

    it('should handle undefined and null values', () => {
        const result = cn('base', undefined, null, 'end');
        expect(result).toBe('base end');
    });
});
