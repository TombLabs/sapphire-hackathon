import { ButtonWallet } from "@/components/button-wallet";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/useUserHooks";
import { connection, paymentWallet } from "@/lib/constants";
import {
  fetcher,
  getFormatDate,
  tryCatchErrorHandler,
} from "@/lib/helpers/utils";
import { mintPublicCnft, tipInSol } from "@/lib/helpers/web3-helpers";
import { PublicGeneration, SapphireUser } from "@/types";
import { useClipboard } from "@mantine/hooks";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import { publicKey, sol } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosResponse } from "axios";
import bs58 from "bs58";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuHeart } from "react-icons/lu";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

const LIMIT_AMOUNT = 40;
const generator = ["all", "dalle-3", "stability", "leonardo"];
const sortByOptions = [
  { value: "asc createdAt", name: "Newest" },
  { value: "desc createdAt", name: "Oldest" },
  { value: "asc likes", name: "Highest Likes" },
  { value: "desc likes", name: "Lowest Likes" },
];

export default function ExplorePage() {
  const {
    data: user,
    isLoading: isLoadingUser,
    mutate: mutateUser,
  } = useUser();
  const [selected, setSelected] = useState<PublicGeneration | null>(null);
  const [isLiking, setIsLiking] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const wallet = useAnchorWallet();
  const clipboard = useClipboard({ timeout: 500 });

  const { data, isLoading, error, size, setSize, mutate } = useSWRInfinite<
    PublicGeneration[]
  >(
    (index) =>
      `/api/generations/public?limit=${LIMIT_AMOUNT}&skip=${
        LIMIT_AMOUNT * index
      }&generator=${router.query.generator}&order=${
        router.query.order
      }&sortBy=${router.query.sortBy}&isMintable=${router.query.isMintable}`
  );

  const generations = useMemo(() => {
    return data ? ([] as PublicGeneration[]).concat(...data) : [];
  }, [data]);

  const isLoadingMore = useMemo(() => {
    return (
      isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
    );
  }, [data, size, isLoading]);

  const isEmpty = useMemo(() => {
    return data?.[0]?.length === 0;
  }, [data]);

  const isEnd = useMemo(() => {
    return isEmpty || (data && data[data.length - 1]?.length < LIMIT_AMOUNT);
  }, [data, isEmpty]);

  const handleOnLikeClicked = useCallback(
    async (id: string) => {
      if (isLoadingUser) {
        toast.error(
          "Your account is loading, please try again once it's loaded"
        );
        return;
      }
      console.log(id);
      if (!user) {
        toast.error("Could not find your user account");
        return;
      }

      const generationIndex = generations.findIndex(
        (_generation) => _generation.id == id
      );
      if (generationIndex < 0) {
        toast.error("Could not find generation");
        return;
      }

      const generation = generations[generationIndex];
      const isLiked = generation.likesRecieved?.find(
        (_like) => _like?.likerId == user.id
      )
        ? true
        : false;
      setIsLiking(generation.src);

      try {
        await axios.put("/api/likes", {
          url: generation.src,
          like: !isLiked,
          genId: id,
        });

        let generationLikes = generation.likesRecieved.length;
        isLiked ? generationLikes-- : generationLikes++;

        const updatedData = [...generations];
        updatedData[generationIndex].likesRecieved.length = generationLikes;

        const updatedDataChunks = [];
        for (let i = 0; i < updatedData.length; i += LIMIT_AMOUNT) {
          const chunk = updatedData.slice(i, i + LIMIT_AMOUNT);
          updatedDataChunks.push(chunk);
        }

        await Promise.all([
          mutate(updatedDataChunks, { revalidate: true }),
          mutateUser(),
        ]);
      } catch (err) {
        tryCatchErrorHandler(err);
      }
      setIsLiking("");
    },
    [generations, user, isLoadingUser]
  );

  const handleOnRemoveClick = useCallback(async () => {
    if (!selected) {
      toast.error("Please select an image to remove");
      return;
    }
    if (isLoadingUser) {
      toast.error("Your account is loading, please try again once it's loaded");
      return;
    }
    if (!user) {
      toast.error("Could not find your user account");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Your account do not have the right authority");
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete("/api/social/delete", {
        params: { id: selected.id },
      });
      await mutate();
      setSelected(null);
    } catch (err: any) {
      tryCatchErrorHandler(err);
    }
    setIsDeleting(false);
  }, [selected, user, isLoadingUser]);

  async function handlePublicMint() {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    setIsMinting(true);
    try {
      const { data: user } = (await axios.get(
        `/api/user/get/${selected?.userId}`
      )) as AxiosResponse<SapphireUser>;
      if (!user)
        return toast.error(
          "Could not find artist account, please try again later."
        );

      const { builder, umi } = await mintPublicCnft(
        wallet!,
        selected?.src!,
        selected?.name!,
        user.wallets[0]
      );

      await builder
        .add(
          transferSol(umi, {
            amount: sol(0.001),
            destination: publicKey(user.wallets[0]),
          })
        )
        .add(
          transferSol(umi, {
            amount: sol(0.001),
            destination: fromWeb3JsPublicKey(paymentWallet),
          })
        )
        .sendAndConfirm(umi)
        .then(async (res) => {
          console.log(`https://solscan.io/tx/${bs58.encode(res.signature)}`);
          setIsMinting(false);
          toast.success("Minted successfully");
          const saveNft = await axios.post("/api/nfts/save/mintedNft", {
            mint: "cNFT-" + Date.now().toString(),
            wallet: wallet.publicKey.toBase58(),
            uri: selected?.src!,
            type: "public cNFT",
          });
          return;
        })
        .catch((err) => {
          console.log(err);
          setIsMinting(false);
          toast.error("Minting failed");
          return;
        });
    } catch (err: any) {
      tryCatchErrorHandler(err);
      setIsMinting(false);
    }
  }

  return (
    <>
      <NextSeo title="Explore" />
      <div className="sm:px-6 sm:pt-8 pb-16 flex flex-col sm:gap-16 gap-8 mx-auto max-w-7xl overflow-hidden w-full">
        <div className=" aspect-[4/1] sm:rounded-md w-full relative overflow-hidden">
          <div className="w-full flex flex-row justify-between items-start p-2 border-b-[1px] border-border mb-6">
            <p className="text-4xl font-bold">Welcome To Sapphire</p>
          </div>
          <p className="font-semibold text-lg">Getting Started</p>
          <div className="w-full grid grid-cols-4 gap-2 mt-2 h-40">
            <Link href="/generate/dalle">
              <div className="h-full flex flex-col justify-center items-center rounded-lg relative hover-text cursor-pointer hover:border-[1px] hover:border-white">
                <Image
                  src="/images/trydalle.webp"
                  alt="dalle-3"
                  fill
                  className="h-full w-full object-cover absolute inset-0 opacity-40 rounded-lg hover:opacity-50"
                />
                <p className="text-base text-xl font-semibold z-20">
                  Try Dalle-3
                </p>
              </div>
            </Link>
            <Link href="/generate/leonardo">
              <div className="h-full flex flex-col justify-center items-center rounded-lg relative hover-text cursor-pointer hover:border-[1px] hover:border-white">
                <Image
                  src="/images/tryleo.webp"
                  alt="dalle-3"
                  fill
                  className="h-full w-full object-cover absolute inset-0 opacity-40 rounded-lg hover:opacity-50"
                />
                <p className="text-base text-xl font-semibold z-20">
                  Try Leonardo AI
                </p>
              </div>
            </Link>
            <Link href="/generate/stability">
              <div className="h-full flex flex-col justify-center items-center rounded-lg relative hover-text cursor-pointer hover:border-[1px] hover:border-white">
                <Image
                  src="/images/trystability.webp"
                  alt="dalle-3"
                  fill
                  className="h-full w-full object-cover absolute inset-0 opacity-40 rounded-lg hover:opacity-50"
                />
                <p className="text-base text-xl font-semibold z-20">
                  Try Stability AI
                </p>
              </div>
            </Link>
            <Link href="/purchase">
              <div className="h-full flex flex-col justify-center items-center rounded-lg relative hover-text cursor-pointer hover:border-[1px] hover:border-white">
                <Image
                  src="/images/buysapphires.webp"
                  alt="dalle-3"
                  fill
                  className="h-full w-full object-cover absolute inset-0 opacity-40 rounded-lg hover:opacity-50"
                />
                <p className="text-base text-xl font-semibold z-20">
                  Buy Sapphires
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:px-0 px-4">
          <p className="font-semibold text-lg">Featured Creators</p>

          <div className="flex gap-4 overflow-auto pb-4">
            {[...Array(20)].map((_, i) => (
              <Link
                key={i + "featured-creators"}
                href={""}
                // href={`/${handle}`}
                className=" sm:w-72 w-64 rounded-md overflow-hidden border shrink-0 hover:border-foreground"
              >
                <div className="h-24 relative overflow-hidden">
                  <Image
                    src="https://nftstorage.link/ipfs/bafkreigq25m4f6vkyz7rvdytstukhkjx5yeof576m5w2mcfzm7mquj6rli"
                    alt="avatar"
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className=" sm:-mt-16 -mt-8 border-4 border-background aspect-square rounded-full mx-auto relative sm:w-32 w-24 overflow-hidden">
                  <Image
                    src="https://nftstorage.link/ipfs/bafkreigq25m4f6vkyz7rvdytstukhkjx5yeof576m5w2mcfzm7mquj6rli"
                    alt="avatar"
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="text-center p-4">
                  <p>Ancient Human</p>
                  <p className="text-muted-foreground text-xs">
                    @ancienthumans
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:px-0 px-4">
          <p className="font-semibold text-lg">Popular Generations</p>

          <div className="flex gap-4 overflow-auto pb-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i + "popular-generation"}
                className="relative border rounded-md overflow-hidden sm:w-64 w-56 shrink-0"
              >
                <div className=" aspect-square relative">
                  <Image
                    src="https://nftstorage.link/ipfs/bafkreigq25m4f6vkyz7rvdytstukhkjx5yeof576m5w2mcfzm7mquj6rli"
                    alt="avatar"
                    fill
                    className="h-full w-full object-cover"
                  />
                  <Button
                    size={"sm"}
                    variant={"outline"}
                    className="h-8 px-2 absolute top-2 right-2"
                    disabled={!!isLiking}
                  >
                    100
                    <LuHeart />
                  </Button>
                </div>
                <div className="p-4 flex gap-2 items-center">
                  <div className=" relative w-9 aspect-square rounded-full overflow-hidden">
                    <Image
                      src="https://nftstorage.link/ipfs/bafkreigq25m4f6vkyz7rvdytstukhkjx5yeof576m5w2mcfzm7mquj6rli"
                      alt="avatar"
                      fill
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">by</p>
                    <p>Ancient Human</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="justify-start z-10 border-y flex-nowrap overflow-x-auto flex gap-2 bg-background sticky xl:top-0 top-16 sm:px-6 h-16 items-center px-4">
        <Select
          value={
            generator.includes(router.query.generator as string)
              ? (router.query.generator as string)
              : "all"
          }
          onValueChange={(value) =>
            router.replace(
              { query: { ...router.query, generator: value } },
              undefined,
              {
                shallow: true,
              }
            )
          }
        >
          <SelectTrigger className="w-auto capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generator.map((_value) => (
              <SelectItem key={_value} value={_value} className="capitalize">
                Generator: {_value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            sortByOptions.some(
              (_option) =>
                _option.value == router.query.order + " " + router.query.sortBy
            )
              ? router.query.order + " " + router.query.sortBy
              : sortByOptions[0].value
          }
          onValueChange={(value) => {
            const order = value.split(" ")[0];
            const sortBy = value.split(" ")[1];
            router.replace(
              { query: { ...router.query, order: order, sortBy: sortBy } },
              undefined,
              {
                shallow: true,
              }
            );
          }}
        >
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((_option) => (
              <SelectItem key={_option.value} value={_option.value}>
                Sort by: {_option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            checked={router.query.isMintable == "true"}
            id="mintable-only"
            onCheckedChange={(boolean) =>
              router.replace(
                { query: { ...router.query, isMintable: boolean } },
                undefined,
                {
                  shallow: true,
                }
              )
            }
          />
          <Label htmlFor="mintable-only">Only Mintable</Label>
        </div>
      </div>

      <div className="sm:p-6 p-4">
        {error ? (
          <div className="flex-col flex items-center justify-center text-center">
            <h3>Something went wrong</h3>
            <p>Please try again later.</p>
          </div>
        ) : isEmpty ? (
          <div className="flex-col flex items-center justify-center text-center">
            <h3>There are not public generations at the moment</h3>
            <p>Check back again later.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:gap-4 gap-2">
              <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] grid-cols-2 sm:gap-3 gap-2">
                {generations.map((_generation) => (
                  <div
                    key={_generation.id}
                    className="relative overflow-hidden rounded-xl"
                  >
                    <button
                      key={_generation.src}
                      className="group w-full relative aspect-square"
                      onClick={() => setSelected(_generation)}
                    >
                      <Image
                        src={_generation.src}
                        alt={_generation.name || ""}
                        sizes="480px"
                        fill
                        className="group-hover:scale-105"
                      />
                      <span className="sr-only">photo id {_generation.id}</span>
                    </button>
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      className="h-8 px-2 absolute top-2 right-2"
                      disabled={!!isLiking}
                      isLoading={isLiking == _generation.src}
                      onClick={() => handleOnLikeClicked(_generation.id)}
                    >
                      {isLiking !== _generation.src && (
                        <>
                          {_generation.likesRecieved?.length || ""}
                          <LuHeart
                            className={`${
                              _generation.likesRecieved?.find(
                                (_like) => _like?.likerId === user?.id
                              )
                                ? "fill-destructive text-destructive"
                                : ""
                            }`}
                          />
                        </>
                      )}
                    </Button>
                  </div>
                ))}

                {isLoadingMore &&
                  Array(LIMIT_AMOUNT)
                    .fill("")
                    .map((e, i) => (
                      <Skeleton
                        key={`loading-card-${i}`}
                        className="w-full aspect-square"
                      />
                    ))}
              </div>
              {!isEnd && !isLoadingMore && (
                <Button onClick={() => setSize(size + 1)} className="mx-auto">
                  Load More
                </Button>
              )}
            </div>

            {!!selected && (
              <Dialog
                open={!!selected}
                onOpenChange={() => {
                  setSelected(null);
                  setIsDeleting(false);
                }}
              >
                <DialogContent className="max-w-3xl sm:p-0 p-0">
                  <div className="overflow-hidden rounded-t-xl aspect-square relative">
                    <Image
                      alt="full-screen-image"
                      src={selected.src}
                      fill
                      sizes="800px"
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:pt-0 pt-0 sm:p-6 p-4">
                    <div className="flex flex-row justify-between items-start">
                      <div>
                        <h3>Details</h3>
                        <div>
                          <p>Name: {selected.name || "-"}</p>
                          <p>Generator: {selected.aiEngine}</p>
                          <p>Created: {getFormatDate(selected.createdAt)}</p>
                        </div>
                      </div>
                      <TipCreator selectedGeneration={selected} user={user!} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p>Prompt</p>
                      <div className="border border-input p-3 py-3 rounded-xl">
                        {selected.prompt}
                      </div>
                    </div>

                    <Button
                      variant={"secondary"}
                      onClick={() => clipboard.copy(selected.prompt)}
                    >
                      {clipboard.copied ? "Copied" : "Copy Prompt"}
                    </Button>
                    {selected.isMintable && wallet?.publicKey ? (
                      <Button
                        variant={"secondary"}
                        isLoading={isMinting}
                        onClick={() => {
                          handlePublicMint();
                        }}
                      >
                        Mint
                      </Button>
                    ) : selected.isMintable && !wallet?.publicKey ? (
                      <ButtonWallet />
                    ) : null}

                    {user?.role == "admin" && (
                      <Button
                        isLoading={isDeleting}
                        disabled={isDeleting}
                        variant={"secondary"}
                        onClick={handleOnRemoveClick}
                      >
                        Remove From Public
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    </>
  );
}

const TipCreator = ({
  user,
  selectedGeneration,
}: {
  user: SapphireUser;
  selectedGeneration: PublicGeneration;
}) => {
  const { data: creator, isLoading: isLoadingCreator } = useSWR<SapphireUser>(
    `/api/user/get/${selectedGeneration.userId}?includeWallets=true`,
    fetcher
  );

  const creatorWallet: string | undefined = useMemo(() => {
    if (creator && creator.wallets.length > 0) return creator.wallets[0];
    return undefined;
  }, [creator]);

  const wallet = useWallet();

  const [tipAmount, setTipAmount] = useState(0);
  const [tipType, setTipType] = useState<"sol" | "sapphires">("sol");
  const [isTipping, setIsTipping] = useState(false);

  async function handleTip() {
    console.log({
      //@ts-ignore
      senderId: user.id,
      senderBalance: user.sapphires,
      //@ts-ignore
      recipientId: creator?._id,
      recipientBalance: creator?.sapphires,
      amount: tipAmount,
      //@ts-ignore
      user: user,
      creator: creator,
    });
    if (!wallet.publicKey && tipType === "sol")
      return toast.error("Please connect your wallet first");
    if (!creatorWallet) return toast.error("Creator wallet not found");

    if (tipType === "sapphires" && tipAmount > user.sapphires)
      return toast.error("You don't have enough sapphires");
    setIsTipping(true);
    const walletBalance = await connection.getBalance(wallet?.publicKey!);

    if (tipType === "sol" && tipAmount * 10 ** 9 > walletBalance) {
      setIsTipping(false);
      return toast.error("You don't have enough sol");
    }

    try {
      if (tipType == "sol") {
        const tx = await tipInSol(
          wallet?.publicKey?.toBase58()!,
          creatorWallet!,
          tipAmount * 10 ** 9
        );
        const txId = await wallet.sendTransaction(tx, connection);
        console.log(txId);
      } else {
        const response = await axios.post("/api/tip", {
          //@ts-ignore
          senderId: user.id,
          //@ts-ignore
          recipientId: creator?._id,
          amount: tipAmount,
        });
      }
      setIsTipping(false);
      toast.success("Tipped successfully");
    } catch (err) {
      setIsTipping(false);
      tryCatchErrorHandler(err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {isLoadingCreator ? (
        <>
          <Skeleton className="w-20"></Skeleton>
          <Skeleton className="border border-input p-3 py-3 rounded-xl" />
        </>
      ) : creatorWallet &&
        !creator?.wallets.includes(wallet?.publicKey?.toBase58()!) ? (
        <>
          <p>Tip Creator</p>
          <Select
            value={tipType}
            onValueChange={(v) => setTipType(v as "sol" | "sapphires")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tip Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tip Type</SelectLabel>
                <SelectItem value="sapphires">Sapphires</SelectItem>
                <SelectItem value="sol">Sol</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex flex-row gap-2 items-center">
            <Input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(parseFloat(e.target.value))}
            />
            <p className="text-muted-foreground">{tipType}</p>
          </div>
          <Button className="w-full" onClick={handleTip} isLoading={isTipping}>
            Tip
          </Button>
        </>
      ) : null}
    </div>
  );
};
