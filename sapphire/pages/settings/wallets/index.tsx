import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useUserWallets } from "@/hooks/useUserHooks";
import { SignInWallet } from "@/lib/helpers/sign-in-wallet";
import { tryCatchErrorHandler } from "@/lib/helpers/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuChevronLeft, LuServerOff, LuTrash } from "react-icons/lu";

export default function WalletsPage() {
  const { data: user, isError } = useUser();

  return (
    <>
      <NextSeo title="Manage Wallets" />
      <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full py-16">
        <Link
          href={"/settings"}
          className="flex items-center gap-1 hover:gap-2 transition-all mr-auto"
        >
          <LuChevronLeft className="w-4 h-4" /> Account Settings
        </Link>
        <Separator />

        <div>
          <h2>Manage Wallets</h2>
          <p className="text-muted-foreground">
            Connecting your wallets to your account will allow you to login with
            it. Connecting your wallets to your account will allow you to login
            with it.
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
            {!user ? (
              <>
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </>
            ) : (
              <>
                <CardAddNewWallets />
                <CardConnectedWallets />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const CardAddNewWallets = () => {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { data: user, mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  // const [isLedger, setisLedger] = useState(false);
  const {
    data: wallets,
    mutate: mutateWallets,
    isError: isWalletsError,
  } = useUserWallets();

  const isWalletLinked = useMemo(() => {
    if (!wallet.publicKey) return false;
    if (!user) return false;
    if (!wallets || isWalletsError) return false;
    return wallets.includes(wallet.publicKey.toString());
  }, [user, wallet, wallets]);

  const handleOnLink = async () => {
    setIsLoading(true);
    try {
      if (!wallet.publicKey) return;

      const signInWallet = new SignInWallet({
        domain: window.location.host,
        publicKey: wallet.publicKey.toBase58(),
        type: wallet.signMessage ? "message" : "transaction",
      });
      const signature = await signInWallet.signIn(wallet);

      await axios.put("/api/user/wallet", {
        message: signInWallet,
        signature: signature,
      });
      await mutateWallets();
      toast.success("Wallet linked");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsLoading(false);
  };

  if (!user) return <Skeleton className="h-80" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link a new Wallet</CardTitle>
        <CardDescription>
          Connect a wallet and click link to add it to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              {!wallet.publicKey ? (
                ""
              ) : isWalletLinked ? (
                <Label className="text-green-500">Already linked</Label>
              ) : (
                <Label className=" text-destructive">Not linked</Label>
              )}

              <div
                className={`p-4 py-3 border rounded-md ${
                  !wallet.publicKey
                    ? ""
                    : isWalletLinked
                    ? "border-green-600"
                    : "border-destructive"
                }`}
              >
                {!!wallet.publicKey ? wallet.publicKey.toString() : "-"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!!wallet.publicKey && (
                <Button variant={"outline"} onClick={wallet.disconnect}>
                  Disconnect
                </Button>
              )}
              <Button variant={"secondary"} onClick={() => setVisible(true)}>
                {!!wallet.publicKey ? "Change" : "Connect"} Wallet
              </Button>
            </div>
          </div>

          {/* {!!anchorWallet && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ledger"
                aria-label="toggle"
                disabled={isLoading}
                checked={isLedger}
                onCheckedChange={setisLedger}
              />
              <Label htmlFor="ledger">Enable this if you are using a Ledger.</Label>
            </div>
          )} */}
        </div>
      </CardContent>
      <CardFooter className="py-3">
        <Button
          isLoading={isLoading}
          disabled={isLoading || !wallet.publicKey || isWalletLinked}
          onClick={handleOnLink}
        >
          Link
        </Button>
      </CardFooter>
    </Card>
  );
};

const CardConnectedWallets = () => {
  const { data: user, mutate } = useUser();
  const [isRemovingWallet, setIsRemovingWallet] = useState("");
  const { data: wallets, mutate: mutateWallets } = useUserWallets();

  const handleOnUnlink = useCallback(
    async (wallet: string) => {
      if (!user) {
        toast.error("Could not get user");
        return;
      }
      setIsRemovingWallet(wallet);
      try {
        await axios.delete("/api/user/wallet", { params: { wallet: wallet } });
        await mutateWallets();
        toast.success("Wallet removed");
      } catch (err) {
        tryCatchErrorHandler(err);
      }
      setIsRemovingWallet("");
    },
    [user]
  );

  if (!user) return <Skeleton className="h-80" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Wallets</CardTitle>
        <CardDescription>
          Wallets that are connected to your account.
        </CardDescription>
        <CardDescription>
          Wallets that are connected to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!wallets || wallets.length <= 0 ? (
          <div className="p-4 border rounded-md">No wallet connected</div>
        ) : (
          <div className="border rounded-md grid">
            {wallets.map((_wallet) => (
              <div
                key={_wallet}
                className="flex items-center p-2 gap-2 border-b overflow-hidden w-full last:border-b-0"
              >
                <p className="p-2 w-full truncate">{_wallet}</p>
                <Button
                  isLoading={isRemovingWallet == _wallet}
                  disabled={isRemovingWallet == _wallet}
                  size={"icon"}
                  variant={"outline"}
                  className="shrink-0"
                  onClick={() => handleOnUnlink(_wallet)}
                >
                  <LuTrash className="h-4 w-4" />
                  <span className=" sr-only">delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
