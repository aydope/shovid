import { Suspense, lazy, useEffect, useState, type ComponentType } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchDialog } from "@/components/SearchDialog";
import { PageSkeleton, ScrollProgress } from "@/components/Ui";
import { Chatbot } from "@/components/Chatbot";
import { A11yPanel } from "@/components/A11yPanel";
import { BackToTop, ScrollFX } from "@/components/ScrollFX";

const pick = <M extends Record<string, ComponentType>>(
  load: () => Promise<M>,
  key: keyof M,
) => lazy(() => load().then((m) => ({ default: m[key] })));

const forms = () => import("@/pages/Forms");
const info = () => import("@/pages/Info");
const lists = () => import("@/pages/Lists");
const landing = () => import("@/pages/Landing");
const auth = () => import("@/pages/Auth");
const plansPage = () => import("@/pages/Plans");
const ordersPage = () => import("@/pages/Orders");
const promoPage = () => import("@/pages/Promotions");
const adminPages = () => import("@/pages/AdminPages");
const memberPages = () => import("@/pages/MemberPages");
const Dashboard = lazy(() => import("@/layouts/Dashboard"));

const admin: Array<[string, ComponentType]> = [
  ["orders", pick(adminPages, "AdminOrders")],
  ["products", pick(adminPages, "AdminProducts")],
  ["customers", pick(adminPages, "AdminCustomers")],
  ["reviews", pick(adminPages, "AdminReviews")],
  ["coupons", pick(adminPages, "AdminCoupons")],
  ["settings", pick(adminPages, "AdminSettings")],
];
const member: Array<[string, ComponentType]> = [
  ["orders", pick(memberPages, "MemberOrders")],
  ["subscription", pick(memberPages, "MemberSubscription")],
  ["wishlist", pick(memberPages, "MemberWishlist")],
  ["addresses", pick(memberPages, "MemberAddresses")],
  ["rewards", pick(memberPages, "MemberRewards")],
  ["settings", pick(memberPages, "MemberSettings")],
];
const AdminHome = pick(adminPages, "AdminOverview");
const MemberHome = pick(memberPages, "MemberOverview");

const routes: Array<[string, ComponentType]> = [
  ["/", lazy(() => import("@/pages/Home"))],
  ["/shop", lazy(() => import("@/pages/Shop"))],
  ["/product/:id", lazy(() => import("@/pages/Product"))],
  ["/journal/:slug", lazy(() => import("@/pages/Post"))],
  ["/checkout", lazy(() => import("@/pages/Checkout"))],
  ["/journal", lazy(() => import("@/pages/Journal"))],
  ["/collections", pick(lists, "Collections")],
  ["/cart", pick(lists, "Cart")],
  ["/wishlist", pick(lists, "Wishlist")],
  ["/login", pick(auth, "Login")],
  ["/register", pick(auth, "Register")],
  ["/contact", pick(forms, "Contact")],
  ["/track", pick(ordersPage, "Track")],
  ["/wholesale", pick(forms, "Wholesale")],
  ["/about", pick(info, "About")],
  ["/faq", pick(info, "Faq")],
  ["/shipping", pick(info, "Shipping")],
  ["/size-guide", pick(info, "SizeGuide")],
  ["/privacy", pick(info, "Privacy")],
  ["/terms", pick(info, "Terms")],
  ["/new-arrivals", pick(landing, "NewArrivals")],
  ["/sale", pick(landing, "Sale")],
  ["/lookbook", pick(landing, "Lookbook")],
  ["/membership", pick(plansPage, "Plans")],
  ["/promotions", pick(promoPage, "Promotions")],
  ["/gift-cards", pick(landing, "GiftCards")],
  ["/stores", pick(landing, "Stores")],
  ["/sustainability", pick(landing, "Sustainability")],
  ["/careers", pick(landing, "Careers")],
];

export default function App() {
  const location = useLocation();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <>
      <ScrollProgress />
      <ScrollFX />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-full focus:bg-ink focus:p-3 focus:text-white"
      >
        Skip to content
      </a>
      <Header onSearch={() => setSearching(true)} />
      <SearchDialog open={searching} onClose={() => setSearching(false)} />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              {routes.map(([path, Page]) => (
                <Route key={path} path={path} element={<Page />} />
              ))}
              <Route path="/admin" element={<Dashboard kind="admin" />}>
                <Route index element={<AdminHome />} />
                {admin.map(([p, Page]) => (
                  <Route key={p} path={p} element={<Page />} />
                ))}
              </Route>
              <Route path="/account" element={<Dashboard kind="member" />}>
                <Route index element={<MemberHome />} />
                {member.map(([p, Page]) => (
                  <Route key={p} path={p} element={<Page />} />
                ))}
              </Route>
              <Route
                path="*"
                element={
                  <p className="py-40 text-center text-5xl font-semibold">
                    Page not found
                  </p>
                }
              />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <A11yPanel />
      <BackToTop />
      <Chatbot />
    </>
  );
}
