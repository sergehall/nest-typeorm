export default function Loading() {
  return (
    <div className="shell loading-state" role="status">
      <span className="loading-state__mark" aria-hidden="true" />
      <p>Loading the interface…</p>
    </div>
  );
}
