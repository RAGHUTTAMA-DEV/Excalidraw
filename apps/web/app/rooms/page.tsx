"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AuthStore from "../Zustand/AuthStore";
import { useRooms } from "../hooks/useRooms";
import { api, apiErrorMessage } from "../lib/api";
import { paths } from "../lib/paths";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { CreateRoomModal } from "../components/rooms/CreateRoomModal";
import { EmptyBoardsArt } from "../components/rooms/EmptyBoardsArt";
import { RoomCard, RoomCardSkeleton } from "../components/rooms/RoomCard";
import type { Room } from "../Zustand/RoomStore";

export default function RoomsPage() {
  const { token, user } = AuthStore();
  const router = useRouter();
  const { rooms, isLoading, isError, errorMessage, fetchRooms } = useRooms();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const getMyRooms = async () => {
    if (!user?.id) return;
    setMyLoading(true);
    try {
      const response = await api.get<{ rooms: Room[] }>(`/api/room/my-rooms/${user.id}`);
      setMyRooms(response.data.rooms ?? []);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load your boards"));
    } finally {
      setMyLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push(paths.login);
      return;
    }
    void fetchRooms();
    void getMyRooms();
  }, [token, router, fetchRooms]);

  const mineIds = useMemo(() => new Set(myRooms.map((room) => room.id)), [myRooms]);
  const discover = rooms.filter((room) => !mineIds.has(room.id));

  const openRoom = (roomId: number) => {
    router.push(paths.room(roomId));
  };

  const joinThenOpen = async (roomId: number) => {
    setBusyId(roomId);
    try {
      await api.post(`/api/room/join/${roomId}`);
      toast.success("Pulled up a stool");
      openRoom(roomId);
    } catch (err) {
      const message = apiErrorMessage(err, "Failed to join room");
      if (message.toLowerCase().includes("already")) {
        openRoom(roomId);
        return;
      }
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const createRoom = async (payload: { name: string; description: string }) => {
    try {
      const response = await api.post<{ room: Room }>("/api/room", payload);
      const room = response.data.room;
      if (!room?.id) {
        throw new Error("Room was created without an id");
      }
      try {
        await api.post(`/api/room/join/${room.id}`);
      } catch {
        // creator may already be attached
      }
      toast.success("Board pinned");
      openRoom(room.id);
    } catch (err) {
      throw new Error(apiErrorMessage(err, "Failed to create room"));
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-40" />
      <AppHeader />
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-copper">Studio floor</p>
            <h1 className="mt-2 font-display text-5xl italic leading-none">
              Evening, {firstName}.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              Your sheets on the left of the day. Strangers’ tables below, if you want a seat.
            </p>
          </div>
          <Button className="px-5 py-3" onClick={() => setCreateOpen(true)}>
            New board
          </Button>
        </div>

        <section>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-3xl italic">My boards</h2>
            <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              {myRooms.length} pinned
            </span>
          </div>
          {myLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          ) : myRooms.length === 0 ? (
            <EmptyState
              visual={<EmptyBoardsArt />}
              title="Create your first board"
              description="A blank sheet with your name in the corner. Invite others once the ink is down."
              action={<Button onClick={() => setCreateOpen(true)}>Pin a sheet</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  actionLabel="Open"
                  onAction={() => openRoom(room.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-3xl italic">Discover</h2>
            <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              Join, then the canvas
            </span>
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          ) : isError ? (
            <p className="text-danger">{errorMessage}</p>
          ) : discover.length === 0 ? (
            <EmptyState
              title="No other tables"
              description="You already sit at every board, or the floor is empty. Make another."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discover.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  actionLabel="Join"
                  busy={busyId === room.id}
                  onAction={() => void joinThenOpen(room.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createRoom}
      />
    </div>
  );
}
