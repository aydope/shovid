import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, useFocusFirstError } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { demo, useApp } from "@/auth";
import { useToast } from "@/toast";

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { user, login, register, logout } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const isLogin = mode === "login";
  useFocusFirstError(errors);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!isLogin && !f.name.trim()) next.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) next.email = "Enter an email like name@example.com";
    if (!f.password) next.password = "Enter your password";
    else if (!isLogin && f.password.length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;
    const r = isLogin ? login(f.email, f.password) : register(f.name, f.email, f.password);
    if (r.error) { setFormError(r.error); return; }
    toast(isLogin ? "Welcome back" : "Account created");
    navigate(params.get("next") ?? (r.role === "admin" ? "/admin" : "/account"), { replace: true });
  };

  if (user) {
    return (
      <PageShell title="You are signed in" lead={`${user.name} (${user.email})`}>
        <div className="flex gap-3"><Link to={user.role === "admin" ? "/admin" : "/account"}><Button>Open dashboard</Button></Link><Button variant="outline" onClick={() => { logout(); toast("Signed out", "info"); }}>Sign out</Button></div>
      </PageShell>
    );
  }

  return (
    <PageShell title={isLogin ? "Sign in" : "Join Shovid"} lead={isLogin ? "Access your orders, subscription and rewards." : "Create a free Silver account and upgrade any time."}>
      <form onSubmit={submit} noValidate className="max-w-md space-y-5">
        <p className="text-sm text-ink/70">Fields marked * are required.</p>
        {!isLogin && <Field label="Full name" required value={f.name} onChange={set("name")} autoComplete="name" error={errors.name} />}
        <Field label="Email" type="email" required value={f.email} onChange={set("email")} autoComplete="email" error={errors.email} />
        <Field label="Password" type="password" required value={f.password} onChange={set("password")} autoComplete={isLogin ? "current-password" : "new-password"} hint={isLogin ? undefined : "At least 8 characters."} error={errors.password} />
        {formError && <p role="alert" className="rounded-2xl bg-oxblood/10 p-4 text-sm text-oxblood">{formError}</p>}
        <Button type="submit" className="w-full">{isLogin ? "Sign in" : "Create account"}</Button>
        <p className="text-sm">{isLogin ? <>New here? <Link to="/register" className="font-medium text-gold underline">Create an account</Link></> : <>Already a member? <Link to="/login" className="font-medium text-gold underline">Sign in</Link></>}</p>
      </form>
      {isLogin && (
        <div className="mt-10 max-w-md rounded-3xl bg-gold/5 p-6 ring-1 ring-gold/20">
          <p className="text-sm font-semibold">Demo accounts</p>
          <div className="mt-3 flex gap-2">{(["admin", "member"] as const).map((k) => <Button key={k} type="button" size="sm" variant="outline" onClick={() => setF((s) => ({ ...s, ...demo[k] }))}>Fill {k}</Button>)}</div>
          <p className="mt-3 text-xs text-ink/70">Stored only in this browser. Never reuse a real password here.</p>
        </div>
      )}
    </PageShell>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
