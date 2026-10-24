import { planList } from "@/commerce";
import { posts, products, ratingOf, stores } from "@/data";
import { terms } from "./nlp";

export interface Doc { id: string; tag: string; title: string; text: string; link?: string; lang?: "fa" }

export const docs: Doc[] = [
  { id: "returns", tag: "policy", title: "Returns and refunds", link: "/shipping", text: "Unworn shoes in their original box can be returned within 30 days for a full refund to the original payment method. Returns are free worldwide, and refunds arrive within 5 working days of us receiving the parcel." },
  { id: "shipping", tag: "policy", title: "Shipping and delivery", link: "/shipping", text: "We ship to 48 countries. EU orders arrive in 2 to 4 working days and international orders in 4 to 8. Shipping is free over $150 (or lower with a membership plan), otherwise it is a flat $15." },
  { id: "sizing", tag: "policy", title: "Sizing and fit", link: "/size-guide", text: "Sizes run EU 40 to 45. Measure your foot length in centimetres and match it to the size chart. Between sizes, choose the larger size for running shoes and your usual size for lifestyle sneakers. Each product page shows a fit meter based on buyer feedback." },
  { id: "payment", tag: "policy", title: "Payment methods", link: "/checkout", text: "You can pay by card or by bank transfer at checkout. Card details are validated in the browser and only the last 4 digits are stored. Bank transfer orders are held until the payment arrives." },
  { id: "gifts", tag: "policy", title: "Gift cards and gifting", link: "/gift-cards", text: "Digital gift cards from $50 to $500 arrive by email instantly and are valid for two years. Gift wrapping is free on every order." },
  { id: "contact", tag: "policy", title: "Talk to an advisor", link: "/contact", text: "Our client advisors reply by email within one working day. Gold members get priority replies and Noir members get a concierge." },
  { id: "alterations", tag: "policy", title: "Repairs and resoling", link: "/account/subscription", text: "Defects are repaired free for 60 days. Gold includes 2 free repairs a year and Noir includes unlimited repairs, covering resoling, cleaning and stitching." },
  { id: "care-knit", tag: "care", title: "Caring for running shoes", text: "Rinse mesh uppers with lukewarm water and a soft brush, never use a washing machine or dryer, and air dry away from heat with paper inside to hold the shape." },
  { id: "care-leather", tag: "care", title: "Caring for sneakers", text: "Brush off dirt, clean uppers with mild soap and a damp cloth, remove laces to wash them separately and air dry away from heat. Brush suede with a suede brush and avoid soaking." },
  { id: "care-coat", tag: "care", title: "Storing your sneakers", text: "Keep sneakers in a ventilated spot out of direct sun, with shoe trees or paper inside to hold their shape. Rotate pairs to let the foam recover." },
  { id: "stores", tag: "policy", title: "Store locations", link: "/stores", text: `Fittings are free and take about thirty minutes. ${stores.map(([n, a, h, p]) => `${n}: ${a}, ${h}, ${p}`).join(". ")}.` },
  { id: "plans", tag: "policy", title: "Membership plans", link: "/membership", text: planList.map((p) => `${p.name} costs ${p.price.month ? `$${p.price.month} a month or $${p.price.year} a year` : "nothing"}: ${p.perks.join(", ")}`).join(". ") + "." },
  { id: "rewards", tag: "policy", title: "Points and rewards", link: "/account/rewards", text: "Members earn 1 to 2 points per dollar depending on their plan. Rewards: $10 voucher at 500 points, free repair at 1,200, $50 voucher at 2,500 and a private styling session at 4,000." },
  { id: "promos", tag: "policy", title: "Promotions", link: "/promotions", text: "Recurring offers apply automatically at checkout: Friday Flash 15% every Friday, Weekend Running Sale 20% on Running every Saturday and Sunday, Payday Week 10% in the first 7 days of the month and the Autumn Trail Event 25% on Trail in October and November. Offers stack with your member discount up to 40% of the subtotal." },
  { id: "careers", tag: "policy", title: "Careers", link: "/careers", text: "Open roles: Footwear Designer in Porto (full time), Client Advisor in Berlin (full time), Frontend Engineer (remote, full time) and Visual Merchandiser in Paris (part time). Apply through the contact page." },
  { id: "about", tag: "policy", title: "About Shovid", link: "/about", text: "Shovid is a footwear house from Porto, Portugal. We design premium sneakers for running, courts, trails and the city, make them in small runs, and repair them for life. We source full grain leather, suede and recycled mesh from audited suppliers." },
  { id: "returns-fa", lang: "fa", tag: "policy", title: "مرجوعی و بازگشت وجه", link: "/shipping", text: "کفش‌های نپوشیده در جعبه‌ی اصلی را می‌توانید تا ۳۰ روز پس از دریافت برگردانید و کل مبلغ را به همان روش پرداخت پس بگیرید. مرجوعی در سراسر جهان رایگان است و بازگشت وجه حداکثر ۵ روز کاری پس از رسیدن بسته انجام می‌شود." },
  { id: "shipping-fa", lang: "fa", tag: "policy", title: "ارسال و تحویل", link: "/shipping", text: "به ۴۸ کشور ارسال می‌کنیم. سفارش‌های اروپا ۲ تا ۴ روز کاری و سفارش‌های بین‌المللی ۴ تا ۸ روز کاری طول می‌کشد. ارسال برای سفارش بالای ۱۵۰ دلار رایگان است (با عضویت از ۷۵ دلار یا کمتر)، در غیر این صورت ۱۵ دلار." },
  { id: "sizing-fa", lang: "fa", tag: "policy", title: "راهنمای سایز", link: "/size-guide", text: "سایزها از ۴۰ تا ۴۵ اروپایی است. طول پای خود را به سانتی‌متر اندازه بگیرید و با جدول سایز مقایسه کنید. اگر بین دو سایز ماندید، برای کفش دویدن سایز بزرگ‌تر و برای کفش روزمره سایز همیشگی‌تان را بردارید. صفحه‌ی هر محصول نشانگر تناسب سایز بر اساس نظر خریداران دارد." },
  { id: "payment-fa", lang: "fa", tag: "policy", title: "روش‌های پرداخت", link: "/checkout", text: "در پرداخت می‌توانید با کارت بانکی یا انتقال بانکی پرداخت کنید. اطلاعات کارت در مرورگر اعتبارسنجی می‌شود و فقط ۴ رقم آخر نگهداری می‌شود. سفارش‌های انتقال بانکی تا رسیدن مبلغ نگه داشته می‌شوند. این نسخه آزمایشی است و مبلغی کسر نمی‌شود." },
  { id: "gifts-fa", lang: "fa", tag: "policy", title: "کارت هدیه", link: "/gift-cards", text: "کارت هدیه‌ی دیجیتال از ۵۰ تا ۵۰۰ دلار بلافاصله با ایمیل ارسال می‌شود و دو سال اعتبار دارد. بسته‌بندی هدیه برای همه‌ی سفارش‌ها رایگان است." },
  { id: "contact-fa", lang: "fa", tag: "policy", title: "گفت‌وگو با مشاور", link: "/contact", text: "مشاوران ما ظرف یک روز کاری از طریق ایمیل پاسخ می‌دهند. اعضای گلد پاسخ اولویت‌دار و اعضای نوآر پشتیبانی اختصاصی دارند." },
  { id: "alterations-fa", lang: "fa", tag: "policy", title: "تعمیر و کف‌عوض‌کردن", link: "/account/subscription", text: "ایراد ساخت تا ۶۰ روز رایگان تعمیر می‌شود. پلن گلد ۲ تعمیر رایگان در سال و پلن نوآر تعمیر نامحدود دارد؛ شامل کف‌عوض‌کردن، تمیزکاری و دوخت." },
  { id: "care-knit-fa", lang: "fa", tag: "care", title: "نگهداری از کفش دویدن", text: "رویه‌ی توری کفش دویدن را با آب ولرم و برس نرم بشویید، هرگز در ماشین لباسشویی یا خشک‌کن نگذارید و دور از حرارت و با کاغذ داخل کفش خشک کنید." },
  { id: "care-leather-fa", lang: "fa", tag: "care", title: "نگهداری از اسنیکر", text: "خاک کفش را برس بزنید، رویه را با صابون ملایم و پارچه‌ی مرطوب پاک کنید، بند کفش را جدا بشویید و دور از حرارت خشک کنید. جیر را با برس جیر تمیز کنید و از خیس شدن دور نگه دارید." },
  { id: "care-coat-fa", lang: "fa", tag: "care", title: "انبار کردن کفش", text: "کفش را در جای هوادار و دور از نور مستقیم خورشید نگه دارید، داخلش کاغذ یا قالب بگذارید و جفت‌ها را بچرخانید تا فوم فرصت بازیابی داشته باشد." },
  { id: "stores-fa", lang: "fa", tag: "policy", title: "فروشگاه‌ها", link: "/stores", text: `امتحان کفش رایگان است و حدود سی دقیقه طول می‌کشد. ${stores.map(([n, a, h, p]) => `${n}: ${a}، ${h}، ${p}`).join(". ")}.` },
  { id: "plans-fa", lang: "fa", tag: "policy", title: "پلن‌های عضویت", link: "/membership", text: planList.map((p) => `${p.name}: ${p.price.month ? `ماهانه ${p.price.month} دلار یا سالانه ${p.price.year} دلار` : "رایگان"}، ${p.discount}٪ تخفیف، ${p.points} برابر امتیاز، ارسال رایگان ${p.freeShipAt ? `از ${p.freeShipAt} دلار` : "همیشه"}، ${p.alterations > 50 ? "تعمیر نامحدود" : p.alterations ? `${p.alterations} تعمیر رایگان در سال` : "بدون تعمیر رایگان"}`).join(". ") + "." },
  { id: "rewards-fa", lang: "fa", tag: "policy", title: "امتیاز و جایزه", link: "/account/rewards", text: "اعضا به ازای هر دلار ۱ تا ۲ امتیاز می‌گیرند. جوایز: کوپن ۱۰ دلاری با ۵۰۰ امتیاز، تعمیر رایگان با ۱٬۲۰۰ امتیاز، کوپن ۵۰ دلاری با ۲٬۵۰۰ و جلسه‌ی استایل خصوصی با ۴٬۰۰۰ امتیاز." },
  { id: "promos-fa", lang: "fa", tag: "policy", title: "پروموشن‌ها", link: "/promotions", text: "پیشنهادهای تکرارشونده خودکار در پرداخت اعمال می‌شوند: جمعه‌ی فلش ۱۵٪ هر جمعه، حراج آخر هفته‌ی دویدن ۲۰٪ روی کفش دویدن شنبه و یکشنبه، هفته‌ی حقوق ۱۰٪ در ۷ روز اول هر ماه و رویداد پاییزی تریل ۲۵٪ در مهر و آبان. این تخفیف‌ها با تخفیف عضویت جمع می‌شوند، تا سقف ۴۰٪ جمع سفارش." },
  { id: "careers-fa", lang: "fa", tag: "policy", title: "فرصت‌های شغلی", link: "/careers", text: "موقعیت‌های باز: طراح کفش در پورتو (تمام‌وقت)، مشاور مشتری در برلین (تمام‌وقت)، توسعه‌دهنده‌ی فرانت‌اند (دورکاری، تمام‌وقت) و ویترین‌ساز در پاریس (پاره‌وقت). از صفحه‌ی تماس درخواست دهید." },
  { id: "about-fa", lang: "fa", tag: "policy", title: "درباره شاوید", link: "/about", text: "شاوید (Shovid) یک خانه‌ی کفش از پورتو در پرتغال است. اسنیکرهای ممتاز برای دویدن، زمین تنیس، مسیرهای طبیعت و شهر طراحی می‌کنیم، در تعداد کم تولید می‌کنیم و مادام‌العمر تعمیر می‌کنیم. چرم تمام‌دانه، جیر و توری بازیافتی را از تأمین‌کنندگان بازرسی‌شده می‌گیریم." },
  ...products.map((p): Doc => ({ id: `product-${p.id}`, tag: "product", title: p.name, link: `/product/${p.id}`, text: `${p.name} is a ${p.category} sneaker priced at $${p.price}. ${p.note}. ${p.stock} pairs in stock. Rated ${ratingOf(p).toFixed(1)} stars.` })),
  ...posts.map((p): Doc => ({ id: `post-${p.slug}`, tag: "journal", title: p.title, link: `/journal/${p.slug}`, text: `${p.excerpt} ${p.body.join(" ")}` })),
];

const indexed = docs.map((d) => ({ d, t: terms(`${d.title} ${d.title} ${d.text}`) }));
const avg = indexed.reduce((s, x) => s + x.t.length, 0) / indexed.length;
const df = new Map<string, number>();
indexed.forEach(({ t }) => new Set(t).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));

export function retrieve(query: string, tag?: string, k = 3, lang: "en" | "fa" = "en") {
  const q = terms(query);
  return indexed
    .filter(({ d }) => (lang === "fa" ? d.lang === "fa" || d.tag === "product" : d.lang !== "fa") && (!tag || d.tag === tag))
    .map(({ d, t }) => {
      let score = 0;
      for (const w of new Set(q)) {
        const f = t.filter((x) => x === w).length;
        if (!f) continue;
        const idf = Math.log(1 + (indexed.length - (df.get(w) ?? 0) + 0.5) / ((df.get(w) ?? 0) + 0.5));
        score += idf * ((f * 2.5) / (f + 1.5 * (0.25 + (0.75 * t.length) / avg)));
      }
      return { doc: d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
