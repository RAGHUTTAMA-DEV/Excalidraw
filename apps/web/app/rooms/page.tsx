"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AuthStore from "../Zustand/AuthStore";
import { useRooms } from "../hooks/useRooms";
import { api, apiErrorMessage } from "../lib/api";
import { paths } from "../lib/paths";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import type { Room } from "../Zustand/RoomStore";

export default function RoomsPage() {
  const { token, user } = AuthStore();
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const { rooms, isLoading, isError, errorMessage, fetchRooms } = useRooms();
  const [myRooms, setMyRooms] = useState<Room[]>([]);

  const getMyRooms = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get<{ rooms: Room[] }>(`/api/room/my-rooms/${user.id}`);
      setMyRooms(response.data.rooms);
    } catch (err) {
      console.log(err);
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

  const openRoom = (roomId: number) => {
    router.push(paths.room(roomId));
  };

  const handleJoinRoom = async (roomId: number) => {
    try {
      await api.post(`/api/room/join/${roomId}`);
      toast.success("Joined room");
      openRoom(roomId);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to join room"));
    }
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post<{ room: Room }>("/api/room", {
        name: nameRef.current?.value,
        description: descriptionRef.current?.value,
      });
      const room = response.data.room;
      if (room?.id) {
        try {
          await api.post(`/api/room/join/${room.id}`);
        } catch {
          // already a member, or join is optional after create
        }
        toast.success("Room created");
        openRoom(room.id);
        return;
      }
      toast.success("Room created");
      await fetchRooms();
      await getMyRooms();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to create room"));
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
        <div>
          <h1 className="font-display text-4xl italic">Boards</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Create or join a board, then open the canvas. Hub polish is Phase 3.
          </p>
        </div>

        <section>
          <h2 className="mb-4 font-display text-2xl">All rooms</h2>
          {isLoading && <p className="text-ink-soft">Loading rooms…</p>}
          {isError && <p className="text-danger">{errorMessage}</p>}
          {!isLoading && !isError && rooms.length === 0 && (
            <EmptyState
              title="No boards yet"
              description="Create one below to start a shared drafting table."
            />
          )}
          <div className="grid gap-3">
            {!isLoading &&
              !isError &&
              rooms.map((room) => (
                <Card key={room.id}>
                  <h3 className="font-medium">{room.name}</h3>
                  {room.description ? (
                    <p className="text-sm text-ink-soft">{room.description}</p>
                  ) : null}
                  <Button className="mt-3" onClick={() => void handleJoinRoom(room.id)}>
                    Join and open
                  </Button>
                </Card>
              ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl">My rooms</h2>
          {!isLoading && myRooms.length === 0 && (
            <EmptyState title="You have not joined a board yet" />
          )}
          <div className="grid gap-3">
            {myRooms.map((room) => (
              <Card key={room.id}>
                <h3 className="font-medium">{room.name}</h3>
                <p className="text-sm text-ink-soft">{room.description}</p>
                <Button className="mt-3" onClick={() => openRoom(room.id)}>
                  Open canvas
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl">Create room</h2>
          <Card>
            <form className="flex flex-col gap-3" onSubmit={handleCreateRoom}>
              <Input label="Room name" name="name" placeholder="War room" ref={nameRef} />
              <Input
                label="Description"
                name="description"
                placeholder="Optional"
                ref={descriptionRef}
              />
              <Button type="submit">Create and open</Button>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
}
