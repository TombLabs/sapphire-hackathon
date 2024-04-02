import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserAccounts } from "@/hooks/useUserHooks";
import axios from "axios";
import { signIn } from "next-auth/react";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { LuChevronLeft, LuExternalLink, LuServerOff } from "react-icons/lu";

type Socials = { name: string; icon: any; baseUrl: string };
const socials: Socials[] = [
  { name: "Twitter", icon: FaXTwitter, baseUrl: "https://twitter.com/i/user/" },
  {
    name: "Discord",
    icon: FaDiscord,
    baseUrl: "https://discordapp.com/users/",
  },
];

export default function SocialsPage() {
  const { isError } = useUserAccounts();
  return (
    <>
      <NextSeo title="Link Socials" />
      <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full py-16">
        <Link
          href={"/settings"}
          className="flex items-center gap-1 hover:gap-2 transition-all mr-auto"
        >
          <LuChevronLeft className="w-4 h-4" /> Account Settings
        </Link>
        <Separator />

        <div>
          <h2>Socials</h2>
          <p className="text-muted-foreground">
            Connecting your socials to your account will allow you to login with it.
          </p>
        </div>

        {isError ? (
          <Card>
            <CardHeader className="py-24">
              <div className="flex flex-col text-center items-center justify-center gap-2">
                <LuServerOff className="h-6 w-6" />
                <p>Something went wrong</p>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            {socials.map((_social) => (
              <SocialCard key={_social.name} social={_social} />
            ))}
          </div>
        )}
      </div>{" "}
    </>
  );
}

const SocialCard = ({ social }: { social: Socials }) => {
  const { data: userAccounts, mutate } = useUserAccounts();
  const [isLoading, setIsLoading] = useState(false);
  const { query } = useRouter();

  const account = useMemo(() => {
    if (!userAccounts) return null;

    const account = userAccounts.find(
      (_userAccount) => _userAccount.provider == social.name.toLocaleLowerCase()
    );
    return account;
  }, [userAccounts, social]);

  const handleUnlink = useCallback(
    async (provider: string) => {
      if (!userAccounts) {
        toast.error("Could not get user accounts");
        return;
      }
      setIsLoading(true);
      try {
        await axios.delete("/api/accounts/", { params: { provider: provider } });
        await mutate();
        toast.success("Unlinked!");
      } catch (err: any) {
        toast.error(err.message);
        console.log(err);
      }
      setIsLoading(false);
    },
    [userAccounts]
  );

  if (!userAccounts) return <Skeleton className="h-80" />;
  return (
    <Card key={social.name} className="relative">
      {!!account && (
        <Link
          href={`${social.baseUrl}${account.providerAccountId}`}
          target="_blank"
          className="absolute top-3 right-3"
        >
          <LuExternalLink className="w-4 h-4" />
          <span className="sr-only">visit {social.name} account</span>
        </Link>
      )}

      <CardHeader>
        <CardTitle>
          <social.icon className="h-8 w-8 " />
        </CardTitle>
        <CardDescription>Connect your {social.name} account.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex border rounded-md overflow-hidden max-w-xs">
            <div className="border-r py-2 px-3 flex items-center justify-center bg-muted whitespace-nowrap">
              ID
            </div>
            <Input
              disabled
              aria-label={`${social.name} id`}
              value={account?.providerAccountId || "-"}
              className="border-none rounded-none"
            />
          </div>
          {query.provider == social.name && query.error == "OAuthAccountNotLinked" && (
            <p className="text-destructive">
              The {query.provider} account you are trying to connect is already connected to another
              user account.
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="py-3">
        {!!account ? (
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            variant={"outline"}
            onClick={() => handleUnlink(social.name.toLocaleLowerCase())}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={() =>
              signIn(social.name.toLocaleLowerCase(), {
                callbackUrl: `${window.location.pathname}?provider=${social.name}`,
              })
            }
          >
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
