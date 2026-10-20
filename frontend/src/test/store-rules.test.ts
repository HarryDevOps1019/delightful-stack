import { describe, expect, it } from "vitest";
import { reducer, DELIVERY_FLAT_CENTS, FREE_DELIVERY_OVER_CENTS } from "@/context/cart";
import { listProducts } from "@/services/catalog";
import { products } from "@/data/catalog";
import { checkoutSchema } from "@/routes/checkout";

const lowStock = products.find((p) => p.sku === "AE-AUD-2004")!; // stock 3, has variants

describe("cart stock cap", () => {
  it("never exceeds stock for one line", () => {
    const s = reducer([], { type: "add", productId: lowStock.id, qty: 10 });
    expect(s[0]!.qty).toBe(3);
  });
  it("caps across variants of the same product", () => {
    let s = reducer([], { type: "add", productId: lowStock.id, qty: 2, variant: "Black" });
    s = reducer(s, { type: "add", productId: lowStock.id, qty: 5, variant: "White" });
    expect(s.reduce((n, l) => n + l.qty, 0)).toBe(3);
  });
  it("cannot add out-of-stock items", () => {
    const out = products.find((p) => p.stock === 0)!;
    expect(reducer([], { type: "add", productId: out.id, qty: 1 })).toEqual([]);
  });
});

describe("delivery rules", () => {
  it("is Rs. 450 flat with free delivery from Rs. 25,000", () => {
    expect(DELIVERY_FLAT_CENTS).toBe(45000);
    expect(FREE_DELIVERY_OVER_CENTS).toBe(2500000);
  });
});

describe("search", () => {
  it.each([
    ["Soundbar", "AE-AUD-2002"],
    ["AE-MOB-4003", "AE-MOB-4003"],
    ["xgimi", "AE-TV-5003"],
    ["FX-888D", "AE-CMP-1003"],
  ])("%s finds %s", async (q, sku) => {
    const r = await listProducts({ q, pageSize: 50 });
    expect(r.items.map((p) => p.sku)).toContain(sku);
  });
});

describe("checkout validation", () => {
  const ok = {
    fullName: "Nimal Perera",
    email: "n@example.lk",
    phone: "0771234567",
    address: "12 Galle Road",
    city: "Colombo",
    payment: "cod",
  };
  it("accepts a Sri Lankan mobile", () => expect(checkoutSchema.safeParse(ok).success).toBe(true));
  it("rejects a bad mobile number", () =>
    expect(checkoutSchema.safeParse({ ...ok, phone: "12345" }).success).toBe(false));
});
