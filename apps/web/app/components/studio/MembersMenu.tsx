"use client";

import { useState } from "react";
import type { RoomMember } from "./types";
import { cn } from "../../lib/cn";

function initial(member: RoomMember) {
  const source = member.name || member.email || "?";
  return source.slice(0, 1).toUpperCase();
}

function label(member: RoomMember) {
  const name = [member.name, member.lastName].filter(Boolean).join(" ");
  return name || member.email || `Hand ${member.id}`;
}

type MembersMenuProps = {
  members: RoomMember[];
};

export function MembersMenu({ members }: MembersMenuProps) {
  const [open, setOpen] = useState(false);
  const shown = members.slice(0, 4);
  const extra = Math.max(0, members.length - shown.length);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded-full border border-line bg-paper py-0.5 pl-1 pr-2"
        title="People at this table"
      >
        <span className="flex -space-x-2">
          {shown.map((member) => (
            <span
              key={member.id}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-paper bg-ink text-[11px] text-paper"
            >
              {initial(member)}
            </span>
          ))}
          {members.length === 0 ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line text-[10px] text-ink-soft">
              0
            </span>
          ) : null}
        </span>
        {extra > 0 ? (
          <span className="ml-2 text-xs text-ink-soft">+{extra}</span>
        ) : (
          <span className="ml-2 text-xs text-ink-soft">{members.length}</span>
        )}
      </button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 top-10 z-30 w-56 rounded-xl border border-line bg-paper p-2 shadow-xl"
          )}
        >
          <p className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            At this table
          </p>
          {members.length === 0 ? (
            <p className="px-2 py-2 text-sm text-ink-soft">Just you, so far.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] text-paper">
                  {initial(member)}
                </span>
                <span className="truncate text-sm">{label(member)}</span>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
