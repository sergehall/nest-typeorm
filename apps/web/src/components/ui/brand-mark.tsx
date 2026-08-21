type BrandMarkProps = {
  readonly compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__bracket">&#123;</span>
      {!compact && <span className="brand-mark__spark">●</span>}
      <span className="brand-mark__bracket">&#125;</span>
    </span>
  );
}
