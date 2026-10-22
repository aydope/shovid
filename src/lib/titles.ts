import { useEffect } from "react";

const names: Record<string, string> = {
  shop: "Shop", collections: "Collections", cart: "Your bag", wishlist: "Wishlist", checkout: "Checkout", login: "Sign in", register: "Join Shovid",
  track: "Track your order", journal: "Journal", about: "About", contact: "Contact", faq: "FAQ", shipping: "Shipping and returns", "size-guide": "Size guide",
  wholesale: "Wholesale", privacy: "Privacy", terms: "Terms of sale", "new-arrivals": "New arrivals", sale: "Sale", lookbook: "Lookbook",
  membership: "Membership", "gift-cards": "Gift cards", stores: "Stores", sustainability: "Sustainability", careers: "Careers", promotions: "Promotions",
  account: "My account", admin: "Admin",
};

export const titleFor = (pathname: string) => {
  const seg = pathname.split("/").filter(Boolean);
  const name = seg.length ? names[seg[0]] : undefined;
  return name ? `${name} | Shovid` : "Shovid | Premium sneakers";
};

export function usePageTitle(title?: string) {
  useEffect(() => {
    if (title) document.title = `${title} | Shovid`;
  }, [title]);
}
