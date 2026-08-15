"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthStore from "../../Zustand/AuthStore";
import { apiErrorMessage, loginRequest, registerRequest } from "../../lib/api";
import { paths } from "../../lib/paths";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type Mode = "login" | "signup";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, isLoading, setIsLoading } = AuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const validate = () => {
    const next: FieldErrors = {};
    if (mode === "signup" && name.trim().length < 2) {
      next.name = "Give us at least two letters.";
    }
    if (!email.trim()) {
      next.email = "Enter the email you used to sign up.";
    }
    if (!password) {
      next.password = "Enter a password.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setFormError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result =
        mode === "login"
          ? await loginRequest(email.trim(), password)
          : await registerRequest({ name: name.trim(), email: email.trim(), password });
      login(result.user, result.token);
      router.push(paths.rooms);
    } catch (err) {
      setFormError(
        apiErrorMessage(
          err,
          mode === "login" ? "Invalid email or password" : "Could not create the account"
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rise">
      <p className="text-[11px] uppercase tracking-[0.26em] text-copper">
        {mode === "login" ? "Returning hand" : "New desk"}
      </p>
      <h1 className="mt-2 font-display text-4xl italic leading-none">
        {mode === "login" ? "Wipe your boots." : "Take a stool."}
      </h1>
      <p className="mt-3 mb-8 text-sm leading-relaxed text-ink-soft">
        {mode === "login"
          ? "The paper is still on the table. Pick up where the last stroke left off."
          : "One name, one email, a password. Then the shared sheet."}
      </p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        noValidate
      >
        {mode === "signup" ? (
          <Input
            label="Name"
            name="name"
            autoComplete="given-name"
            placeholder="Ada"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />
        ) : null}
        <Input
          label="Email"
          type="text"
          name="email"
          autoComplete="username"
          inputMode="text"
          placeholder="ada or you@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
          trailing={
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-ink-soft hover:text-ink"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />
        {formError ? <p className="text-sm text-danger">{formError}</p> : null}
        <Button type="submit" fullWidth disabled={isLoading} className="mt-2 py-3">
          {isLoading
            ? mode === "login"
              ? "Checking the ledger…"
              : "Pulling up a stool…"
            : mode === "login"
              ? "Enter the studio"
              : "Claim a desk"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            No desk yet?{" "}
            <Link href={paths.signup} className="text-copper underline-offset-4 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have one?{" "}
            <Link href={paths.login} className="text-copper underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
