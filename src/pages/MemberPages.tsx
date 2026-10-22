import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@mui/material";
import {
  CalendarClock,
  Check,
  Crown,
  Gift,
  MapPin,
  Package,
  Scissors,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPicker, type Picked } from "@/components/MapPicker";
import { ProductCard } from "@/components/ProductCard";
import { planList, plans } from "@/commerce";
import { products } from "@/data";
import { useApp } from "@/auth";
import { useCart } from "@/store";
import { useToast } from "@/toast";
import { cn, fmtDate, money2 } from "@/lib/utils";
import { Panel } from "./AdminPages";

const steps = ["Processing", "Shipped", "Delivered"];
const Title = ({ children }: { children: string }) => (
  <h1 className="font-display mb-6 text-4xl">{children}</h1>
);
const field =
  "h-11 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold";

export function MemberOverview() {
  const { user, plan, points, orders, sub } = useApp();
  const mine = orders.filter((o) => o.email === user?.email);
  const next = planList[planList.findIndex((p) => p.id === plan.id) + 1];
  return (
    <>
      <Title>{`Welcome back, ${user?.name.split(" ")[0] ?? ""}`}</Title>
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className={cn(
            "rounded-3xl bg-linear-to-br p-8 text-white lg:col-span-2",
            plan.color,
          )}
        >
          <p className="flex items-center gap-2 text-sm">
            <Crown size={16} /> {plan.name} member
            {sub && `, renews ${fmtDate(sub.renews)}`}
          </p>
          <p className="font-display mt-4 text-6xl">
            {points.toLocaleString()}{" "}
            <span className="text-xl text-white/70">points</span>
          </p>
          <p className="mt-4 text-sm text-white/85">
            {plan.points}x points, {plan.discount}% off every order
            {plan.freeShipAt
              ? `, free shipping over $${plan.freeShipAt}`
              : ", free shipping always"}
          </p>
          {next && (
            <Link
              to="/membership"
              className="mt-4 inline-block rounded-full bg-white/20 px-4 py-2 text-xs"
            >
              Upgrade to {next.name} for {next.discount}% off
            </Link>
          )}
        </div>
        <Panel>
          <Package className="text-gold" />
          <p className="font-display mt-4 text-5xl">
            {
              mine.filter(
                (o) => o.status !== "Delivered" && o.status !== "Refunded",
              ).length
            }
          </p>
          <p className="text-sm text-ink/50">Orders in progress</p>
        </Panel>
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold">Recommended for you</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.slice(4, 7).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </>
  );
}

export function MemberOrders() {
  const { user, orders } = useApp();
  const toast = useToast();
  const mine = orders.filter((o) => o.email === user?.email);
  return (
    <>
      <Title>My orders</Title>
      {mine.length === 0 && (
        <Panel>
          No orders yet.{" "}
          <Link to="/shop" className="text-gold">
            Start shopping
          </Link>
        </Panel>
      )}
      <div className="space-y-4">
        {mine.map((o) => {
          const at = Math.max(0, steps.indexOf(o.status));
          return (
            <Panel key={o.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.id}</p>
                  <p className="text-sm text-ink/50">
                    {fmtDate(o.date)}, {money2(o.total)}
                    {o.discount > 0 && `, saved ${money2(o.discount)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast("Reorder is a demo action", "info")}
                >
                  Reorder
                </Button>
              </div>
              <ul className="mt-3 text-sm text-ink/60">
                {o.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {o.status === "Refunded" ? (
                <p className="mt-4 text-sm text-oxblood">Refunded</p>
              ) : (
                <ol className="mt-5 grid grid-cols-3 gap-2">
                  {steps.map((s, i) => (
                    <li key={s} className="text-xs">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          i <= at ? "bg-mint" : "bg-sand",
                        )}
                      />
                      <p
                        className={cn(
                          "mt-2",
                          i <= at ? "font-medium" : "text-ink/40",
                        )}
                      >
                        {s}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}

export function MemberWishlist() {
  const { wish } = useCart();
  const saved = products.filter((p) => wish.includes(p.id));
  return (
    <>
      <Title>Wishlist</Title>
      {saved.length === 0 ? (
        <Panel>
          Nothing saved yet.{" "}
          <Link to="/shop" className="text-gold">
            Browse products
          </Link>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

export function MemberAddresses() {
  const { addresses, addAddress, removeAddress } = useApp();
  const toast = useToast();
  const [f, setF] = useState({ label: "", phone: "", postcode: "", line: "" });
  const [coord, setCoord] = useState<{ lat: number; lng: number }>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((s) => ({ ...s, [k]: e.target.value }));
  const add = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.label.trim()) er.label = "Required";
    if (
      !/^\+?[\d\s()-]{7,20}$/.test(f.phone) ||
      f.phone.replace(/\D/g, "").length < 7
    )
      er.phone = "Enter a valid phone number";
    if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(f.postcode.trim()))
      er.postcode = "Enter a valid postal code";
    if (!f.line.trim())
      er.line = "Choose a place on the map or type the address";
    setErrors(er);
    if (Object.keys(er).length) return;
    addAddress({
      label: f.label.trim(),
      phone: f.phone.trim(),
      postcode: f.postcode.trim(),
      line: f.line.trim(),
      ...coord,
    });
    setF({ label: "", phone: "", postcode: "", line: "" });
    setCoord(undefined);
    toast("Address saved");
  };
  const err = (k: string) =>
    errors[k] && (
      <span role="alert" className="mt-1 block text-xs text-oxblood">
        {errors[k]}
      </span>
    );
  return (
    <>
      <Title>Addresses</Title>
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <Panel key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <MapPin size={16} className="text-gold" /> {a.label}
                </p>
                <p className="mt-1 text-sm text-ink/60">{a.line}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {a.postcode} {a.phone && `, ${a.phone}`}
                </p>
              </div>
              <button
                aria-label={`Remove ${a.label}`}
                onClick={() => {
                  removeAddress(a.id);
                  toast("Address removed", "info");
                }}
                className="cursor-pointer text-oxblood"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Add an address" className="mt-4">
        <MapPicker
          onPick={(p: Picked) => {
            setF((s) => ({
              ...s,
              line: p.line,
              postcode: p.postcode ?? s.postcode,
            }));
            setCoord({ lat: p.lat, lng: p.lng });
          }}
        />
        <form
          onSubmit={add}
          noValidate
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          <label className="text-sm font-medium">
            Label *
            <input
              value={f.label}
              onChange={set("label")}
              placeholder="Home"
              className={cn(field, "mt-2")}
            />
            {err("label")}
          </label>
          <label className="text-sm font-medium">
            Phone *
            <input
              value={f.phone}
              onChange={set("phone")}
              inputMode="tel"
              className={cn(field, "mt-2")}
            />
            {err("phone")}
          </label>
          <label className="text-sm font-medium">
            Postal code *
            <input
              value={f.postcode}
              onChange={set("postcode")}
              className={cn(field, "mt-2")}
            />
            {err("postcode")}
          </label>
          <label className="text-sm font-medium sm:col-span-3">
            Address *
            <textarea
              value={f.line}
              onChange={set("line")}
              rows={2}
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
            {err("line")}
          </label>
          <Button
            type="submit"
            variant="gold"
            className="sm:col-span-3 sm:w-fit"
          >
            Save address
          </Button>
        </form>
      </Panel>
    </>
  );
}

export function MemberRewards() {
  const { points, redeem } = useApp();
  const toast = useToast();
  const rewards = [
    ["$10 voucher", 500, "REWARD10"],
    ["Free repair", 1200, "ALTER1"],
    ["$50 voucher", 2500, "REWARD50"],
    ["Private styling session", 4000, "STYLE1"],
  ] as const;
  const [codes, setCodes] = useState<string[]>([]);
  const go = (name: string, cost: number, code: string) => {
    if (!redeem(cost)) {
      toast("Not enough points", "error");
      return;
    }
    setCodes((c) => [...c, `${name}: ${code}`]);
    toast(`${name} redeemed`);
  };
  return (
    <>
      <Title>Rewards</Title>
      <p className="mb-4 text-lg">
        You have <b>{points.toLocaleString()}</b> points
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map(([n, c, code]) => (
          <Panel key={n}>
            <Gift className="text-gold" />
            <p className="mt-3 font-semibold">{n}</p>
            <p className="text-sm text-ink/50">{c.toLocaleString()} points</p>
            <Button
              size="sm"
              className="mt-4"
              variant={points >= c ? "gold" : "outline"}
              onClick={() => go(n, c, code)}
            >
              Redeem
            </Button>
          </Panel>
        ))}
      </div>
      {codes.length > 0 && (
        <Panel title="Your redeemed rewards" className="mt-4">
          {codes.map((c) => (
            <p key={c} className="font-mono text-sm">
              {c}
            </p>
          ))}
        </Panel>
      )}
    </>
  );
}

export function MemberSubscription() {
  const { sub, plan, cancelSub, bookAlteration } = useApp();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const left = sub ? Math.max(0, plan.alterations - sub.alterationsUsed) : 0;
  const invoices = sub
    ? [0, 1, 2]
        .map((i) => ({
          id: `INV-${1000 + i}`,
          date: new Date(
            new Date(sub.since).getTime() +
              i * (sub.cycle === "year" ? 365 : 30) * 864e5,
          )
            .toISOString()
            .slice(0, 10),
          amount: plan.price[sub.cycle],
        }))
        .filter((x) => new Date(x.date) <= new Date())
    : [];
  const unlocked: Array<[string, boolean]> = [
    ["Member discount", plan.discount > 0],
    ["Free repairs", plan.alterations > 0],
    ["Early access to sales", plan.early],
    ["Private styling session", plan.styling],
    ["Priority support", plan.support !== "Standard"],
  ];
  return (
    <>
      <Title>Subscription</Title>
      <div
        className={cn("rounded-3xl bg-linear-to-br p-8 text-white", plan.color)}
      >
        <p className="flex items-center gap-2 text-sm">
          <Crown size={16} /> {plan.name} plan
        </p>
        <p className="font-display mt-3 text-5xl">
          {sub && plan.price[sub.cycle]
            ? `$${plan.price[sub.cycle]}/${sub.cycle}`
            : "Free"}
        </p>
        {sub ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
            <CalendarClock size={15} /> Member since {fmtDate(sub.since)},
            renews {fmtDate(sub.renews)}
          </p>
        ) : (
          <p className="mt-3 text-sm text-white/85">
            You are on the free plan.
          </p>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Active benefits">
          {unlocked.map(([l, on]) => (
            <p
              key={l}
              className={cn(
                "flex items-center gap-2 py-1 text-sm",
                !on && "text-ink/40",
              )}
            >
              <Check size={15} className={on ? "text-mint" : "text-ink/20"} />{" "}
              {l}
            </p>
          ))}
          <p className="mt-2 text-sm text-ink/60">
            {plan.points}x points, shipping free{" "}
            {plan.freeShipAt ? `over $${plan.freeShipAt}` : "always"}
          </p>
        </Panel>
        <Panel title="Services">
          <p className="flex items-center gap-2 text-sm">
            <Scissors size={15} className="text-gold" /> Repairs left:{" "}
            <b>{plan.alterations > 50 ? "Unlimited" : left}</b>
          </p>
          <Button
            size="sm"
            className="mt-3"
            variant="outline"
            disabled={!sub || (plan.alterations < 50 && left === 0)}
            onClick={() => {
              if (bookAlteration())
                toast("Repair booked, we will email you a slot");
            }}
          >
            Book a repair
          </Button>
          {plan.styling && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast("Styling session requested", "info")}
              >
                Request styling session
              </Button>
            </div>
          )}
        </Panel>
      </div>
      {invoices.length > 0 && (
        <Panel title="Billing history" className="mt-4">
          {invoices.map((i) => (
            <p
              key={i.id}
              className="flex justify-between border-b border-sand py-2 text-sm last:border-0"
            >
              <span>
                {i.id}, {fmtDate(i.date)}
              </span>
              <span>{money2(i.amount)}</span>
            </p>
          ))}
        </Panel>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/membership">
          <Button variant="outline">Change plan</Button>
        </Link>
        {sub &&
          (confirm ? (
            <Button
              variant="outline"
              className="!border-oxblood !text-oxblood"
              onClick={() => {
                cancelSub();
                setConfirm(false);
                toast("Subscription cancelled", "info");
              }}
            >
              Confirm cancellation
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirm(true)}>
              Cancel subscription
            </Button>
          ))}
      </div>
      <p className="mt-6 text-xs text-ink/50">
        Available plans: {planList.map((p) => p.name).join(", ")}. Current:{" "}
        {plans[plan.id].name}.
      </p>
    </>
  );
}

export function MemberSettings() {
  const { user } = useApp();
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    orders: true,
    offers: true,
    sms: false,
  });
  return (
    <>
      <Title>Settings</Title>
      <Panel title="Profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            defaultValue={user?.name}
            aria-label="Name"
            className={field}
          />
          <input
            defaultValue={user?.email}
            aria-label="Email"
            className={field}
          />
        </div>
      </Panel>
      <Panel title="Notifications" className="mt-4">
        {(Object.keys(prefs) as Array<keyof typeof prefs>).map((k) => (
          <div
            key={k}
            className="flex items-center justify-between border-b border-sand py-2 last:border-0"
          >
            <span className="text-sm">
              {k === "sms"
                ? "SMS alerts"
                : `${k[0].toUpperCase()}${k.slice(1)} emails`}
            </span>
            <Switch
              color="secondary"
              checked={prefs[k]}
              onChange={() => setPrefs({ ...prefs, [k]: !prefs[k] })}
              slotProps={{ input: { "aria-label": k } }}
            />
          </div>
        ))}
      </Panel>
      <Button className="mt-4" onClick={() => toast("Profile saved")}>
        Save changes
      </Button>
    </>
  );
}
