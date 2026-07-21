import { Volleyball } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="Não Tem Passe - NTP">
      <span className="brand-ball"><Volleyball size={compact ? 22 : 27} /></span>
      <span className="brand-copy">
        <strong>Não Tem Passe</strong>
        {!compact && <small>4ª Copa NTP</small>}
      </span>
    </div>
  );
}
