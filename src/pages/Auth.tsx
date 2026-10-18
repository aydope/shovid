import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { demo, useApp } from "@/auth";
import { useToast } from "@/toast";

const field = "mt-2 h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold";

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { user, login, register, logout } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const login_ = mode === "login";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!login_ && !f.name.trim()) return setError("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Enter a valid email");
    if (!login_ && f.password.length < 8) return setError("Use at least 8 characters");
    const r = login_ ? login(f.email, f.password) : register(f.name, f.email, f.password);
    if (r.error) return setError(r.error);
    toast(login_ ? "Welcome back" : "Account created");
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
    <PageShell title={login_ ? "Sign in" : "Join Shovid"} lead={login_ ? "Access your orders, subscription and rewards." : "Create a free Silver account and upgrade any time."}>
      <form onSubmit={submit} noValidate className="max-w-md space-y-5">
        {!login_ && <label className="block text-sm font-medium">Full name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} autoComplete="name" /></label>}
        <label className="block text-sm font-medium">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} autoComplete="email" /></label>
        <label className="block text-sm font-medium">Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={field} autoComplete={login_ ? "current-password" : "new-password"} /></label>
        {error && <p role="alert" className="text-sm text-oxblood">{error}</p>}
        <Button type="submit" className="w-full">{login_ ? "Sign in" : "Create account"}</Button>
        <p className="text-sm">{login_ ? <>New here? <Link to="/register" className="text-gold">Create an account</Link></> : <>Already a member? <Link to="/login" className="text-gold">Sign in</Link></>}</p>
      </form>
      {login_ && (
        <div className="mt-10 max-w-md rounded-3xl bg-gold/5 p-6 ring-1 ring-gold/20">
          <p className="text-sm font-semibold">Demo accounts</p>
          <div className="mt-3 flex gap-2">{(["admin", "member"] as const).map((k) => <Button key={k} type="button" size="sm" variant="outline" onClick={() => setF({ ...f, ...demo[k] })}>Fill {k}</Button>)}</div>
          <p className="mt-3 text-xs text-ink/60">Stored only in this browser. Never reuse a real password here.</p>
        </div>
      )}
    </PageShell>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
