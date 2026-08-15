import { Room } from "../../Zustand/RoomStore";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function formatUpdated(value?: string) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type RoomCardProps = {
  room: Room;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
};

export function RoomCard({ room, actionLabel, onAction, busy }: RoomCardProps) {
  const occupied = room.Roomlen ?? room.members?.length ?? 0;
  const cap = room.MaxLen ?? 10;

  return (
    <Card className="flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-copper">
          {room.status === "ACTIVE" || !room.status ? "Open sheet" : room.status.toLowerCase()}
        </p>
        <h3 className="mt-1 font-display text-2xl italic leading-tight">{room.name}</h3>
        <p className="mt-2 min-h-10 text-sm leading-relaxed text-ink-soft">
          {room.description || "No notes on the cover."}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
        <dl className="flex gap-4 text-xs text-ink-soft">
          <div>
            <dt className="uppercase tracking-[0.14em]">Hands</dt>
            <dd className="mt-0.5 text-ink">
              {occupied}/{cap}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.14em]">Updated</dt>
            <dd className="mt-0.5 text-ink">{formatUpdated(room.updatedAt)}</dd>
          </div>
        </dl>
        <Button onClick={onAction} disabled={busy}>
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="h-44 animate-pulse rounded-xl border border-line bg-paper-deep/70" />
  );
}
