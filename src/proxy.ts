// Next.js 16 request Proxy (formerly "middleware"). Clerk 7 supports the
// `proxy.ts` convention on Next 16 — clerkMiddleware() is the handler; only the
// filename changed from the old `middleware.ts`.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes: marketing home + Clerk auth pages.
// Everything else (the (requester) "/app" and (provider) "/work" surfaces)
// requires authentication.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless referenced in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
