import { AuthForm } from "../components/auth/AuthForm";
import { AuthShell } from "../components/auth/AuthShell";

export default function Login() {
  return (
    <AuthShell kicker="Plate 03" quote="Leave the markers. The paper remembers.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
