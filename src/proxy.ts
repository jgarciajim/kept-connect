// Next.js 16 request Proxy (formerly "middleware").
// 1. Refreshes the Supabase Auth session cookie on every request.
// 2. Bounces signed-out visitors on protected routes to /sign-in?next=<path>.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes: marketing, auth pages + callbacks, webhooks, the home-screen icon.
// Everything else (the (requester) "/app" and (provider) "/work" surfaces)
// requires a signed-in user.
const PUBLIC_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/providers(\/.*)?$/, // public marketing: the Pros landing page
  /^\/sign-in(\/.*)?$/,
  /^\/sign-up(\/.*)?$/,
  /^\/forgot-password(\/.*)?$/,
  /^\/auth\/.*$/, // OAuth callback + email-link confirmation
  /^\/api\/stripe\/webhook(\/.*)?$/, // Stripe can't carry a session — verified by signature instead
  /^\/api\/hooks\/.*$/, // DB → app hooks — verified by shared secret header instead
  /^\/apple-icon.*$/, // generated home-screen icon — fetched without a session
];

const isPublic = (path: string) => PUBLIC_PATTERNS.some((re) => re.test(path));

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Do not put code between createServerClient and getUser(): getUser() is what
  // refreshes an expiring session and writes the new cookies onto `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless referenced in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
