import { withAuth } from "next-auth/middleware";

// Export the NextAuth middleware explicitly
export default withAuth;

export const config = {
    matcher: ["/reservation/:path*", "/history/:path*"],
};
