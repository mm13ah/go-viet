type LoadingPanelProps = {
  fullScreen?: boolean;
  status?: string;
};

export function LoadingPanel({
  fullScreen = false,
  status = 'Preparing the trainer',
}: LoadingPanelProps) {
  const content = (
    <div className="app-loading__panel">
      <div
        aria-label="Vietnamese flag"
        className="app-loading__flag"
        role="img"
      >
        <svg
          aria-hidden="true"
          className="app-loading__star"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="m12 2.8 2.33 6.2 6.61.24-5.21 4.08 1.87 6.35L12 15.98l-5.6 3.7 1.87-6.35-5.2-4.08 6.6-.24L12 2.8Z" />
        </svg>
      </div>
      <p className="app-loading__eyebrow">Gõ Việt</p>
      <p className="app-loading__title">Loading</p>
      <p className="app-loading__status">
        {status}
        <span className="app-loading__dots" />
      </p>
    </div>
  );

  if (fullScreen) {
    return <div className="app-loading">{content}</div>;
  }

  return content;
}
