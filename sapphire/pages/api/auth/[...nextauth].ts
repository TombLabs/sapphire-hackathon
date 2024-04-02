import prisma from "@/database/prisma";
import { SAMPLE_AVATAR_URLS } from "@/lib/constants/sample-avatar";
import { SignInWallet } from "@/lib/helpers/sign-in-wallet";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";

const adapter: Adapter = {
  ...PrismaAdapter(prisma),
  // @ts-ignore
  createUser: async (data: Omit<AdapterUser, "id">) => {
    // @ts-ignore
    if (!data.provider || data.provider !== "google") {
      throw new Error("Unauthorized");
    }

    // generate random name
    const name = "Sapphire" + Math.floor(Math.random() * 10000000000);

    //generate random number for pfp
    const random = Math.floor(Math.random() * SAMPLE_AVATAR_URLS.length);

    // add default data here
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: data.email,
        /* handle: name.toLowerCase(), */
        image: SAMPLE_AVATAR_URLS[random],
      }
    });

    return newUser;
  },
};

const providers: Provider[] = [
  CredentialsProvider({
    id: "solana",
    name: "Solana",
    credentials: {},
    async authorize(credentials) {
      // @ts-ignore
      const { message, signature } = credentials;
      if (!message || !signature) return null;

      const signInWallet = new SignInWallet(JSON.parse(message));
      const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

      const isDomainSame = nextAuthUrl.host == signInWallet.domain;
      if (!isDomainSame) return null;

      const validationResult = await signInWallet.validate(signature);
      if (!validationResult) return null;


      const wallet = await prisma.wallet.findFirst({ where: { address: signInWallet.publicKey.toString() } })
      if (!wallet) return null;
      const user = await prisma.user.findFirst({ where: { id: wallet.userId } })
      if (!user) return null;

      return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
    },
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    profile(profile) {

      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        provider: "google",

      };
    },
  }),
  DiscordProvider({
    clientId: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    profile(profile) {
      if (profile.avatar === null) {
        const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
        profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
      } else {
        const format = profile.avatar.startsWith("a_") ? "gif" : "png";
        profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
      }
      return {
        id: profile.id,
        name: profile.username,
        email: profile.email,
        image: profile.image_url,
        provider: "discord",
      };
    },
  }),
  TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    version: "2.0",
    profile(profile) {
      return { ...profile.data, provider: "twitter" };
    },
  }),
];

export const authOptions: NextAuthOptions = {
  adapter,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // @ts-ignore
      if (!!user) token.role = user.role;

      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      if (!!session && !!token.role) session.user.role = token.role || "user";
      if (!!session && !!token.sub) session.user.id = token.sub;

      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    // error: "/", // Error code passed in query string as ?error=
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
