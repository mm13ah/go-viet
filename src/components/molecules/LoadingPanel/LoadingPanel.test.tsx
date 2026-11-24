import { render, screen } from '@testing-library/react';

import { LoadingPanel } from './LoadingPanel';

describe('LoadingPanel', () => {
  it('renders the supplied status', () => {
    render(<LoadingPanel status="Loading words" />);

    expect(screen.getByText('Loading words')).toBeVisible();
  });

  it('uses a full-screen wrapper when requested', () => {
    const { container } = render(<LoadingPanel fullScreen />);

    expect(container.firstElementChild).toHaveClass('app-loading');
  });
});
