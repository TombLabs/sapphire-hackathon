import {
  default as Auctions,
  default as LiveAuctions,
} from "@/components/auctions/live-auctions";
import PastAuctions from "@/components/auctions/past-auctions";
import { ButtonWallet } from "@/components/button-wallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/useUserHooks";
import createAuctionTxBuilder from "@/lib/auction/instructions/createAuction";
import { connection } from "@/lib/constants";
import { fetcher } from "@/lib/helpers/utils";
import { createStandardNft } from "@/lib/helpers/web3-helpers";
import { AIGeneration, AuctionData, SapphireMintedNft } from "@/types";
import { UseFormReturnType, useForm, zodResolver } from "@mantine/form";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Skeleton } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import dayjs from "dayjs";
import { NextSeo } from "next-seo";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuInfo, LuPlus, LuX } from "react-icons/lu";
import useSWR from "swr";
import { z } from "zod";

const AuctionFormSchema = z.object({
  name: z.string(),
  symbol: z.string().max(10),
  description: z.string(),
  image: z.string(),
  sellerFeeBasisPoints: z.number().min(0).max(100),
  isMutable: z.boolean(),
  startingPrice: z.number(),
  minimumBid: z.number(),
  endTime: z.number(),
});

type AuctionFormType = z.infer<typeof AuctionFormSchema>;

const formInitialValues: AuctionFormType = {
  name: "",
  symbol: "",
  description: "",
  image: "",
  sellerFeeBasisPoints: 0,
  isMutable: true,
  startingPrice: 0,
  minimumBid: 0,
  endTime: 0,
};

export default function AuctionPage() {
  const wallet = useAnchorWallet();
  const { data: user } = useUser();
  const { data: mintedNfts, isLoading } = useSWR<SapphireMintedNft[]>(
    `/api/nfts/get/sapphireMints/${wallet?.publicKey.toString()}`,
    fetcher
  );
  const {
    data: auctions,
    error,
    mutate,
  } = useSWR<AuctionData[]>("/api/auctions/fetch/allAuctions", fetcher, {
    refreshInterval: 10000,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<AIGeneration>(
    null!
  );
  const [isSelectNft, setIsSelectNft] = useState(false);
  const [selectedPreviousMint, setSelectedPreviousMint] =
    useState<SapphireMintedNft>(null!);

  const form = useForm<AuctionFormType>({
    validate: zodResolver(AuctionFormSchema),
    initialValues: { ...formInitialValues },
  });

  const isWalletVerified = useMemo(() => {
    const wallets = user?.wallets.map((w: any) => w.address);
    if (!wallet) return false;
    console.log(user);
    if (!wallets?.includes(wallet.publicKey.toString())) return false;
    return true;
  }, [wallet, user]);

  return (
    <>
      <NextSeo title="Sapphire Auctions" />
      <div className="p-6 flex flex-col gap-6">
        <div className="w-full flex flex-row gap-6 items-center flex-wrap">
          <h2>Active Auctions</h2>
          <Button onClick={() => setIsDialogOpen(!isDialogOpen)}>
            <LuPlus className="w-4 h-4" />
            Create Auction
          </Button>
        </div>

        <LiveAuctions
          liveAuctions={
            auctions?.filter((a) => a.account.endTime > Date.now()) || []
          }
          error={error}
          mutate={mutate}
        />
        <div className="w-full flex flex-row gap-6 items-center flex-wrap">
          <h2>Past Auctions</h2>
          <PastAuctions
            pastAuctions={
              auctions?.filter((a) => a.account.endTime < Date.now()) || []
            }
            error={error}
            mutate={mutate}
          />
        </div>
      </div>

      {isDialogOpen && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        >
          <DialogContent className="max-w-5xl grid md:grid-cols-2 gap-8">
            {isSelectNft && (
              <div className="z-[9999] h-full w-full absolute inset-0 backdrop-blur-md flex justify-center items-center">
                <div className="h-3/4 w-3/4 bg-background relative rounded-lg border border-border p-6 gap-4">
                  <LuX
                    onClick={() => setIsSelectNft(false)}
                    className="absolute top-2 right-2 cursor-pointer w-6 h-6"
                  />
                  <p className="text-left text-md font-bold">
                    Select a previously minted NFT
                  </p>
                  <Separator />
                  {isLoading ? (
                    <div className="grid grid-cols-3 w-full h-full overflow-y-auto p-2 items-center gap-2 ">
                      {Array(3).map((_, i) => (
                        <Skeleton key={i} className="h-[150px] w-[150px]" />
                      ))}
                    </div>
                  ) : !mintedNfts?.length ? (
                    <div className="w-full h-full flex justify-center overflow-y-auto p-2 items-center gap-2">
                      <p className="text-md font-semibold">
                        None of your nfts are eligible. Please select a
                        generation!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 w-full h-full overflow-y-auto p-2 items-start gap-2">
                      {mintedNfts?.map((nft) => (
                        <Image
                          onClick={() => {
                            setSelectedPreviousMint(nft);
                            setIsSelectNft(false);
                            setSelectedGeneration(null!);
                          }}
                          key={nft.image_reference}
                          src={nft.image_reference}
                          alt={nft.image_reference}
                          height={150}
                          width={150}
                          className="cursor-pointer hover:border-blue-900/50 hover:border-[1px] rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Create Auction</DialogTitle>
                <DialogDescription className=" capitalize">
                  Creates a new auction using the Solana Blockchain and your
                  generation as an NFT! Must have wallet connected.
                  <br />
                  <br />
                  <span className="text-xs">
                    *Beta: The generation will be minted as a new standard NFT
                    and auctioned. See below for use of previously minted
                    generations*
                  </span>
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <br />
              <SelectGeneration
                setSelectedGeneration={setSelectedGeneration}
                selectedGeneration={selectedGeneration}
                setIsSelectNft={setIsSelectNft}
                selectedPreviousMint={selectedPreviousMint}
                setSelectedPreviousMint={setSelectedPreviousMint}
              />
            </div>
            <AuctionForm
              form={form}
              selectedGeneration={selectedGeneration}
              isWalletVerified={isWalletVerified}
              selectedPreviousMint={selectedPreviousMint}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

const SelectGeneration = ({
  setSelectedGeneration,
  selectedGeneration,
  setIsSelectNft,
  selectedPreviousMint,
  setSelectedPreviousMint,
}: {
  setSelectedGeneration: Dispatch<SetStateAction<AIGeneration>>;
  selectedGeneration: AIGeneration;
  setIsSelectNft: Dispatch<SetStateAction<boolean>>;
  selectedPreviousMint: SapphireMintedNft;
  setSelectedPreviousMint: Dispatch<SetStateAction<SapphireMintedNft>>;
}) => {
  const { data: user, isError } = useUser();

  return (
    <div className="flex flex-col justify-start items-start -mt-8">
      <p className="text-md font-semibold">
        {selectedGeneration
          ? "Selected Generation"
          : selectedPreviousMint
          ? "Selected Nft"
          : "Select Generation"}
      </p>
      {isError ? (
        <div className="flex flex-col justify-center items-center w-full h-60 overflow-y-auto p-2 border-[1px] border-blue-900/20 rounded-lg">
          <p className="text-md font-semibold">Error Loading Generations</p>
        </div>
      ) : selectedGeneration || selectedPreviousMint ? (
        <div className="flex flex-col gap-2 justify-center items-start w-full h-60 p-2 rounded-lg">
          <Image
            src={
              selectedGeneration
                ? selectedGeneration.image
                : selectedPreviousMint.image_reference
            }
            alt={
              selectedGeneration
                ? selectedGeneration.image
                : selectedPreviousMint.image_reference
            }
            height={150}
            width={150}
            className="border-blue-900/50 border-[1px] rounded-lg"
          />

          <Button
            type="button"
            className="h-6 w-[150px]"
            onClick={() => {
              setSelectedGeneration(null!);
              setSelectedPreviousMint(null!);
            }}
          >
            {selectedGeneration ? "Change" : "Generations"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 w-full max-h-[50vh] overflow-y-auto p-2 border-[1px] items-center border-blue-900/20 gap-2 rounded-lg">
          {user?.generations
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((generation) => (
              <Image
                onClick={() => setSelectedGeneration(generation)}
                key={generation.image}
                src={generation.image}
                alt={generation.image}
                height={150}
                width={150}
                className="cursor-pointer hover:border-blue-900/50 hover:border-[1px] rounded-lg"
              />
            ))}
        </div>
      )}
      <div className="flex flex-row justify-start items-center w-full mt-2">
        <p className="text-md font-semibold">
          Use a previously minted nft insted?
        </p>
        <p
          className="text-xs ml-2 bg-background uppercase rounded-md p-1 cursor-pointer"
          onClick={() => setIsSelectNft(true)}
        >
          click here
        </p>
      </div>
    </div>
  );
};

const AuctionForm = ({
  form,
  selectedGeneration,
  selectedPreviousMint,
  isWalletVerified,
}: {
  form: UseFormReturnType<AuctionFormType>;
  selectedGeneration: AIGeneration;
  selectedPreviousMint: SapphireMintedNft;
  isWalletVerified: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const wallet = useAnchorWallet();
  const { theme } = useTheme();

  useEffect(() => {
    if (selectedGeneration === null) return;
    else if (!selectedGeneration.image) return;
    else if (selectedGeneration?.image && !selectedPreviousMint)
      form.setFieldValue("image", selectedGeneration.image);
    else if (selectedPreviousMint && !selectedGeneration?.image)
      form.setFieldValue("image", selectedPreviousMint.image_reference);
    else null;
  }, [selectedGeneration]);

  const handleOnSubmit = async (values: AuctionFormType) => {
    switch (true) {
      case !isWalletVerified:
        return toast.error("Please Verify Your Wallet in Settings Page");
      case !wallet?.publicKey:
        return toast.error("Please Connect a Wallet");
      case selectedGeneration === null && selectedPreviousMint === null:
        return toast.error("Please Select a Generation or NFT");
      case !form.values.name.length:
        return toast.error("Please Enter a Name");
      case !form.values.symbol.length:
        return toast.error("Please Enter a Symbol");
      case !form.values.description.length:
        return toast.error("Please Enter a Description");
      case !form.values.image.length:
        return toast.error("Please Enter an Image");
      case !form.values.startingPrice:
        return toast.error("Please Enter a Starting Price");
      case !form.values.minimumBid:
        return toast.error("Please Enter a Minimum Bid");
      case !form.values.endTime:
        return toast.error("Please Enter an End Time");
      default: {
        console.log("success");
      }
    }

    setIsLoading(true);
    toast.loading(
      selectedGeneration && !selectedPreviousMint
        ? "Minting NFT, then creating auction!"
        : "Creating Auction"
    );

    try {
      if (selectedGeneration && !selectedPreviousMint) {
        const metaplex = Metaplex.make(connection).use(
          walletAdapterIdentity(wallet!)
        );

        const nftCreationBuilder = await createStandardNft(wallet!, false, {
          name: form.values.name,
          symbol: form.values.symbol,
          description: form.values.description,
          sellerFeeBasisPoints: form.values.sellerFeeBasisPoints,
          image: form.values.image,
          isMutable: form.values.isMutable,
        });

        const mint = nftCreationBuilder.getContext().mintAddress;

        const blockhash = await connection.getLatestBlockhash();

        const nftResponse = await nftCreationBuilder.sendAndConfirm(metaplex);

        const saveNft = await axios.post("/api/nfts/save/mintedNft", {
          mint: mint.toBase58(),
          wallet: wallet?.publicKey.toBase58(),
          uri: selectedGeneration.image,
          type: "auction",
        });

        toast.dismiss();
        toast.loading(
          "Minted NFT! Waiting for Auction Creation Transaction to be Signed"
        );

        let proceed = false;
        let cutoffLoop = 0;

        while (!proceed) {
          if (cutoffLoop > 10) {
            toast.error("Error Creating Auction");
            return;
          }
          cutoffLoop++;
          const confirmation = await connection.confirmTransaction(
            nftResponse.response.signature
          );
          // @ts-ignore
          if (confirmation.value.confirmationStatus === "finalized")
            proceed = true;
          await sleep(2000);
        }

        const createAuctionTx = await createAuctionTxBuilder(
          wallet!,
          mint,
          form.values.startingPrice * 10 ** 9,
          form.values.minimumBid * 10 ** 9,
          form.values.endTime
        );

        const blockhash2 = await connection.getLatestBlockhash();
        createAuctionTx.recentBlockhash = blockhash2.blockhash;
        createAuctionTx.feePayer = wallet!.publicKey;

        const signature = await wallet!.signTransaction(createAuctionTx);
        const signedTxResponse2 = await axios.post(
          "/api/transactions/auctionPartialSign",
          {
            tx: signature
              .serialize({ requireAllSignatures: false })
              .toString("base64"),
          }
        );
        const txid = signedTxResponse2.data.txid;
        console.log(txid);

        toast.dismiss();
        toast.success("Auction Created Successfully");
        form.reset();
        setIsLoading(false);
      } else if (selectedPreviousMint && !selectedGeneration) {
        console.log(selectedPreviousMint);
        const createAuctionTx = await createAuctionTxBuilder(
          wallet!,
          // @ts-ignore
          new PublicKey(selectedPreviousMint.nftMint),
          form.values.startingPrice * 10 ** 9,
          form.values.minimumBid * 10 ** 9,
          form.values.endTime
        );

        const blockhash2 = await connection.getLatestBlockhash();
        createAuctionTx.recentBlockhash = blockhash2.blockhash;
        createAuctionTx.feePayer = wallet!.publicKey;

        const signature = await wallet!.signTransaction(createAuctionTx);
        const signedTxResponse2 = await axios.post(
          "/api/transactions/auctionPartialSign",
          {
            tx: signature
              .serialize({ requireAllSignatures: false })
              .toString("base64"),
          }
        );
        const txid = signedTxResponse2.data.txid;
        console.log(txid);

        toast.dismiss();
        toast.success("Auction Created Successfully");
        form.reset();
        setIsLoading(false);
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Error Creating Auction, please try again");
      console.log(e);
    }
    setIsLoading(false);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.onSubmit(handleOnSubmit)}
    >
      <DialogTitle>Auction Details</DialogTitle>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <p>Name</p>
          <Input {...form.getInputProps("name")} />
        </div>

        <div className="flex flex-col gap-2">
          <p>Symbol</p>
          <Input {...form.getInputProps("symbol")} />
        </div>

        <div className="flex flex-col gap-2">
          <p>Description</p>
          <Textarea {...form.getInputProps("description")} />
        </div>
        <div className="flex flex-col gap-2">
          <p>Starting Price</p>
          <Input {...form.getInputProps("startingPrice")} type="number" />
        </div>
        <div className="flex flex-col gap-2">
          <p>Minimum Bid</p>
          <Input {...form.getInputProps("minimumBid")} type="number" />
        </div>
        <div className="flex flex-col gap-2">
          <p>End Time</p>
          <DateTimePicker
            onChange={(e: any) =>
              form.setFieldValue(
                "endTime",
                e?.["$d"] ? new Date(e["$d"]).getTime() : 0
              )
            }
            minDateTime={dayjs()}
            className="text-white bg-[#020617] rounded-lg"
            sx={{
              "& .MuiInputBase-root.Mui-focused": { border: "2px solid white" },
              "& .MuiInputBase-root": {
                border: "1px solid hsl(217 33% 17%)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                color: theme === "dark" ? "white" : "black",
                background: theme === "dark" ? "#020617" : "#fff",
              },
              "& .MuiOutlinedInput-root.MuiFocused": {
                border: "1px solid white",
              },
              "& .MuiOutlinedInput-notchedOutline.MuiFocused": {
                border: "1px solid white",
              },
              "& .MuiInputBase-input": {
                color: theme === "dark" ? "white" : "black",
              },
              "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                fill: theme === "dark" ? "white" : "black",
              },
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p>Seller Fee Basis Points</p>
          <div className="flex items-center gap-4 -mt-2">
            <Slider
              value={[form.values.sellerFeeBasisPoints]}
              onValueChange={(v) =>
                form.setFieldValue("sellerFeeBasisPoints", v[0])
              }
              min={0}
              max={100}
              step={1}
            />
            <p className="w-20 text-center border-border border-2 rounded-lg p-2">
              {form.values.sellerFeeBasisPoints}%
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex items-center gap-2">
            <p>Mutable</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <LuInfo className="text-muted-foreground h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent align="start" className="max-w-xs">
                  Leaving this checked allows the metadata to be updated in the
                  future. Once immutable it cannot be undone.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            checked={form.values.isMutable}
            onCheckedChange={(c) => form.setFieldValue("isMutable", c)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-xs">Cost: 0.05</p>
          {!wallet?.publicKey ? (
            <ButtonWallet />
          ) : !isWalletVerified ? (
            <div className="w-full bg-red-500 rounded-lg p-4">
              <p className="text-md font-bold">
                Your connected wallet is not verified on your account. Please
                verify{" "}
                <Link className="text-md underline" href="/settings/wallets">
                  HERE.
                </Link>
              </p>
            </div>
          ) : wallet?.publicKey ? (
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !isWalletVerified}
              variant={"secondary"}
              onClick={() => handleOnSubmit(form.values)}
            >
              Create Auction
            </Button>
          ) : (
            <ButtonWallet />
          )}
        </div>
      </div>
    </form>
  );
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
