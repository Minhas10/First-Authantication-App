import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { Resend } from 'resend';
const client = new MongoClient(process.env.BETTER_AUTH_DB_URL);
const db = client.db("better-auth");
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            void resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: user.email,
                subject: 'Verify Email',
                html: `<p>Click the link to verify your email: ${url}</p>`,
            });
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expireIn: 60 * 5, // 5 minutes
    },
    database: mongodbAdapter(db, {
        client,
    }),
});

// 