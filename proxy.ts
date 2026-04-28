import { withAuth } from "next-auth/middleware";

export default withAuth(function proxy() {
  // Handled by next-auth; this wrapper satisfies Next.js proxy function requirement.
});

export const config = {
  matcher: ["/converter/:path*", "/profile/:path*"],
};
