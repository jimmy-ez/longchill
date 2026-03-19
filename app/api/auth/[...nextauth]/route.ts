import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LineProvider from "next-auth/providers/line";

export const authOptions: NextAuthOptions = {
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID || "",
            clientSecret: process.env.LINE_CLIENT_SECRET || "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
    session: {
        strategy: "jwt"
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
