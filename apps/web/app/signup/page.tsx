import { AuthForm } from "../components/auth/AuthForm";
import { AuthShell } from "../components/auth/AuthShell";

export default function Signup() {
  return (
    <AuthShell kicker="Plate 01" quote="Pull up a stool. The sheet is still blank.">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
