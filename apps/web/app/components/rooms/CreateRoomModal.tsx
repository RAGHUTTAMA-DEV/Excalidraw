"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type CreateRoomModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; description: string }) => Promise<void>;
};

export function CreateRoomModal({ open, onClose, onCreate }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setError("");
    setBusy(false);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  return (
    <Modal open={open} title="New board" onClose={handleClose}>
      <p className="mb-5 text-sm text-ink-soft">
        Name the sheet. Description is optional — a note on the cover.
      </p>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim()) {
            setError("Give the board a name.");
            return;
          }
          setBusy(true);
          setError("");
          try {
            await onCreate({ name: name.trim(), description: description.trim() });
            reset();
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create the board");
            setBusy(false);
          }
        }}
      >
        <Input
          label="Name"
          name="room-name"
          placeholder="War room"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Input
          label="Description"
          name="room-description"
          placeholder="Optional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Pinning the sheet…" : "Create and open"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
