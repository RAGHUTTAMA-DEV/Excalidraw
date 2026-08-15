import { RedirectIfAuthed } from "../components/AuthGuards";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RedirectIfAuthed>{children}</RedirectIfAuthed>;
}
