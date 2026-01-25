
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Frontend Environment', () => {
  it('renders without crashing', () => {
    render(<div data-testid="test-div">Hello World</div>);
    const element = screen.getByTestId('test-div');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});
