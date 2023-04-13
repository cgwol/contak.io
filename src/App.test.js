import { render, screen } from '@testing-library/react';
import Default from './routes/default';

test('renders learn react link', () => {
  render(<Default />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
