"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  next: string;
};

export function AdminLoginForm({ next }: Props) {
  const [pending, startTransition] = useTransition();
  const [secret, setSecret] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await adminLogin({ secret, next });
      } catch (err) {
        if (err && typeof err === "object" && "digest" in err) {
          const digest = String((err as { digest?: string }).digest ?? "");
          if (digest.startsWith("NEXT_REDIRECT")) return;
        }
        toast.error("Login failed");
      }
    });
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader>
        <CardTitle>Admin sign in</CardTitle>
        <CardDescription>Enter the admin password configured for this deployment.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="secret">Password</Label>
            <Input
              id="secret"
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
