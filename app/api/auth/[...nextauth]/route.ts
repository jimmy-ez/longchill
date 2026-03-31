import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LineProvider from "next-auth/providers/line";
import { createClient } from "@supabase/supabase-js";

export const authOptions: NextAuthOptions = {
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID || "",
            clientSecret: process.env.LINE_CLIENT_SECRET || "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "public_profile",
                },
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ account }) {
            if (!account) return true;

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

            // Skip database sync if Supabase credentials are not found
            if (!supabaseUrl || !supabaseServiceKey) {
                console.warn("Supabase credentials missing. Skipping user DB sync.");
                return true;
            }

            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            try {
                // Check if user exists
                console.log("Checking if user exists...");
                console.log("Provider:", account.provider);
                console.log("Provider UID:", account.providerAccountId);

                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('provider', account.provider)
                    .eq('provider_uid', account.providerAccountId)
                    .maybeSingle();

                // Insert if not found
                if (!existingUser) {
                    console.log("User not found. Inserting new user...");
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert([{
                            provider: account.provider,
                            provider_uid: account.providerAccountId,
                            updated_at: new Date().toISOString()
                        }]);

                    if (insertError) {
                        console.error("Supabase Insert Error:", insertError);
                    } else {
                        console.log("User successfully inserted!");
                    }
                }
            } catch (error) {
                console.error("Error syncing user to Supabase:", error);
            }

            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

                if (supabaseUrl && supabaseServiceKey) {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey);
                    const { data: dbUser } = await supabase
                        .from('users')
                        .select('id')
                        .eq('provider', account.provider)
                        .eq('provider_uid', account.providerAccountId)
                        .maybeSingle();

                    if (dbUser) {
                        token.id = dbUser.id;
                    } else {
                        token.id = user.id;
                    }
                } else {
                    token.id = user.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || (token.sub as string);
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
    session: {
        strategy: "jwt"
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
