import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';



describe('App', () => {
    it('should render the app', () => {
        render(<App />);
        expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();
    });

    it('should display initial count of 0', () => {
        render(<App />);
        expect(screen.getByRole('button')).toHaveTextContent('count is 0');
    });

    it('should increment count when button is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(button).toHaveTextContent('count is 1');
    });

    it('should increment count multiple times', async () => {
        const user = userEvent.setup();
        render(<App />);

        const button = screen.getByRole('button');
        await user.click(button);
        await user.click(button);
        await user.click(button);

        expect(button).toHaveTextContent('count is 3');
    });

    it('should render Vite and React logos', () => {
        render(<App />);
        const logos = screen.getAllByRole('img');
        expect(logos).toHaveLength(2);
        expect(logos[0]).toHaveAttribute('alt', 'Vite logo');
        expect(logos[1]).toHaveAttribute('alt', 'React logo');
    });
});
