import { Banner } from "@/components/Banner";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductForBanner } from "@/server/db/products";
import { createProductView } from "@/server/db/productViews";
import { canRemoveBranding, canShowDiscountBanner } from "@/server/permissions";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { createElement } from "react";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // ✅ Extract product ID from URL
  const productId = request.nextUrl.pathname.split("/").pop();
  if (!productId) return notFound();
  // ✅ Fetch product from database
  const productFromDb = await db
    .select()
    .from(ProductTable)
    .where(eq(ProductTable.id, productId))
    .limit(1);

  if (!productFromDb.length) return notFound(); // Product not found

  const headersMap = await headers();
  const requestingUrl = headersMap.get("referer") || headersMap.get("origin");
  if (!requestingUrl) return notFound();

  const countryCode = getCountryCode(request);
  if (!countryCode) return notFound();

  const { product, discount, country } = await getProductForBanner({
    id: productId,
    countryCode,
    url: requestingUrl,
  });

  if (!product) return notFound();

  const canShowBanner = await canShowDiscountBanner(product.clerkUserId);

  await createProductView({
    productId: product.id,
    countryId: country?.id,
    userId: product.clerkUserId,
  });

  if (!canShowBanner || !country || !discount) return notFound();

  return new Response(
    await getJavaScript(
      product,
      country,
      discount,
      await canRemoveBranding(product.clerkUserId)
    ),
    { headers: { "content-type": "text/javascript" } }
  );
}

// ✅ FIXED getCountryCode function to avoid `any`
function getCountryCode(request: NextRequest): string | null {
  const geo = (request as NextRequest & { geo?: { country?: string } }).geo;
  return geo?.country ?? (process.env.NODE_ENV === "development" ? process.env.TEST_COUNTRY_CODE ?? null : null);
}

async function getJavaScript(
  product: {
    customization: {
      locationMessage: string;
      bannerContainer: string;
      backgroundColor: string;
      textColor: string;
      fontSize: string;
      isSticky: boolean;
      classPrefix?: string | null;
    };
  },
  country: { name: string },
  discount: { coupon: string; percentage: number },
  canRemoveBranding: boolean
) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return `
    const banner = document.createElement("div");
    banner.innerHTML = '${renderToStaticMarkup(
      createElement(Banner, {
        message: product.customization.locationMessage,
        mappings: {
          country: country.name,
          coupon: discount.coupon,
          discount: (discount.percentage * 100).toString(),
        },
        customization: product.customization,
        canRemoveBranding,
      })
    )}';
    document.querySelector("${
      product.customization.bannerContainer
    }").prepend(...banner.children);
  `.replace(/(\r\n|\n|\r)/g, "");
}