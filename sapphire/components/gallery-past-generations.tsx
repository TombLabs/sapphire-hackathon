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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/useUserHooks";
import { connection, paymentWallet } from "@/lib/constants";
import { tryCatchErrorHandler } from "@/lib/helpers/utils";
import {
  createCollectionNft,
  createFeeIx,
  createStandardNft,
  mintPnftBuilder,
  mintPrivateCnft,
} from "@/lib/helpers/web3-helpers";
import { AIGeneration } from "@/types";
import { useForm, zodResolver } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import { sol } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { AccordionContent } from "@radix-ui/react-accordion";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import bs58 from "bs58";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuCopy, LuDownload, LuInfo, LuPlus } from "react-icons/lu";
import { z } from "zod";
import { ButtonWallet } from "./button-wallet";
import { Accordion, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Image } from "./ui/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

const loadIncrement = 50;

export default function GalleryPastGenerations({
  defaultSort,
}: {
  defaultSort?: boolean;
}) {
  const clipboard = useClipboard({ timeout: 500 });
  const { data: user, isError } = useUser();
  const [selectedGeneration, setSelectedGeneration] =
    useState<AIGeneration | null>(null);
  const [loadAmount, setLoadAmount] = useState(loadIncrement);

  async function handleOnDownload(imageUrl: string) {
    const a = document.createElement("a");
    const date = new Date().toDateString();
    a.style.display = "none";
    a.href = await toDataURL(imageUrl);
    a.download = date + "_SAPPHIRE_GENERATE.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  useEffect(() => {
    if (user?.generations)
      setSelectedGeneration(
        user?.generations?.find((g) => g.image === selectedGeneration?.image) ||
          null
      );
  }, [user, user?.generations]);

  async function toDataURL(imageUrl: string) {
    const result = await axios
      .get(process.env.NEXT_PUBLIC_CORS_PROXY_URL! + imageUrl, {
        responseType: "blob",
      })
      .then((response) => {
        return response.data;
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
    return result;
  }

  return (
    <>
      <div className="px-4 py-6  sm:px-6 flex flex-col gap-6">
        <h2>My Generations</h2>

        <div className="w-full grid grid-cols-4 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 sm:gap-3">
          {isError ? (
            <div className=" col-span-full">Something went wrong.</div>
          ) : !user ? (
            Array(loadAmount)
              .fill("")
              .map((e, i) => (
                <Skeleton
                  key={`skeleton-${i}`}
                  className="w-full aspect-square"
                />
              ))
          ) : user.generations.length <= 0 ? (
            <div className=" col-span-full">
              You have not generated any images.
            </div>
          ) : (
            <>
              {user.generations
                .toSorted((a, b) => b.createdAt - a.createdAt)
                .reverse()
                .slice(0, loadAmount)
                .map((_generation) => (
                  <div
                    key={_generation.image}
                    className="cursor-pointer w-full aspect-square bg-black rounded-xl overflow-hidden relative group"
                    onClick={() => setSelectedGeneration(_generation)}
                  >
                    <Image
                      fill
                      sizes="240px"
                      src={_generation.image}
                      alt={_generation.name || ""}
                      className="group-hover:scale-105 transition-all"
                    />
                  </div>
                ))}

              {!!user && user.generations.length > loadAmount && (
                <div className="flex items-center justify-center border rounded-xl">
                  <Button
                    onClick={() => setLoadAmount(loadAmount + loadIncrement)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!!selectedGeneration && (
        <Dialog
          open={!!selectedGeneration}
          onOpenChange={() => setSelectedGeneration(null)}
        >
          <DialogContent className="max-w-5xl grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <div className="w-full aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={selectedGeneration.image}
                  alt={selectedGeneration.name || ""}
                  fill
                  sizes="480px"
                />
              </div>

              <div className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle>Details</DialogTitle>
                  <DialogDescription className=" capitalize">
                    Generator: {selectedGeneration.aiEngine}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <p>Prompt</p>
                  <div className="border border-input p-3 py-3 rounded-xl">
                    {selectedGeneration.prompt}
                  </div>
                </div>
                <Button
                  variant={"secondary"}
                  onClick={() => clipboard.copy(selectedGeneration.prompt)}
                >
                  <LuCopy className="h-4 w-4" />
                  {clipboard.copied ? "Copied" : "Copy Prompt"}
                </Button>

                <Button
                  variant={"secondary"}
                  onClick={() => handleOnDownload(selectedGeneration.image)}
                >
                  <LuDownload className="h-4 w-4" />
                  Download Image
                </Button>
              </div>
            </div>

            <Separator className="md:hidden" />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`accordion-item-1`}>
                <AccordionTrigger>Edit Generation</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-6">
                    <EditName
                      name={selectedGeneration.name || ""}
                      imageUrl={selectedGeneration.image}
                      isPublic={selectedGeneration.isPublic}
                      generationData={selectedGeneration}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value={`accordion-item-2`}>
                <AccordionTrigger>Mint NFT</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-6">
                    <MintNft imageUrl={selectedGeneration.image} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

const EditName = ({
  generationData,
  name,
  imageUrl,
  isPublic,
}: {
  name: string;
  imageUrl: string;
  isPublic: boolean;
  generationData: AIGeneration;
}) => {
  const { data: user, mutate } = useUser();
  const [currentName, setCurrentName] = useState(name);
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [isMintableLoading, setIsMintableLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  async function handleOnSaveImageName() {
    if (!currentName) {
      toast.error("Please enter an image name");
      return;
    }
    setIsNameLoading(true);
    try {
      await axios.patch("/api/user/update/generationName", {
        id: generationData.id,
        name: currentName,
      });
      await mutate();
      toast.success("Updated!");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsNameLoading(false);
  }
  async function handleMakePublic() {
    setIsPublicLoading(true);
    try {
      await axios.patch("/api/user/update/makePublic", {
        id: generationData.id,
      });
      await mutate();
      toast.success("Updated!");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsPublicLoading(false);
  }
  async function handleRemovePublic() {
    setIsPublicLoading(true);
    try {
      await axios.patch("/api/user/update/removePublic", {
        id: generationData.id,
      });
      await mutate();
      toast.success("Updated!");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsPublicLoading(false);
  }

  async function handleChangeMintable() {
    setIsMintableLoading(true);
    if (!generationData.isPublic) {
      toast.error("Must be public to be mintable");
      setIsMintableLoading(false);
      return;
    }
    if (!user?.wallets || !user.wallets.length) {
      toast.error("Must have a connected wallet to be mintable");
      setIsMintableLoading(false);
      return;
    }

    if (!generationData.name) {
      toast.error("Must have a name to be mintable");
      setIsMintableLoading(false);
      return;
    }
    try {
      await axios.post("/api/user/update/mintable", {
        id: generationData.id,
        genData: generationData,
      });
      await mutate();
      toast.success("Updated!");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsMintableLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <p>Name</p>
        <Input
          value={currentName}
          disabled={isNameLoading}
          onChange={(e) => setCurrentName(e.target.value)}
          placeholder="Enter a name for this image..."
        />
      </div>

      <Button
        variant={"secondary"}
        isLoading={isNameLoading}
        disabled={isNameLoading || !currentName.length}
        onClick={handleOnSaveImageName}
      >
        Save
      </Button>
      <p>Public</p>
      <Button
        variant={"secondary"}
        isLoading={isPublicLoading}
        disabled={isPublicLoading}
        onClick={isPublic ? handleRemovePublic : handleMakePublic}
      >
        {isPublic ? "Remove Public" : "Make Public"}
      </Button>
      <div className="flex flex-row gap-2">
        <p>Mintable</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger type="button">
              <LuInfo className="text-muted-foreground h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent align="start" className="max-w-xs">
              This allows any user to mint a cNFT of your creation! Your first
              connected wallet will be added as a creator with a 5% royalty
              should they sell! You&apo;ll also receive 0.001 SOL for every cNFT
              minted of your generation.
              <br />
              <span className="text-red-500">
                MUST BE PUBLIC AND MUST HAVE A CONNECTED WALLET
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        variant={"secondary"}
        isLoading={isMintableLoading}
        disabled={isMintableLoading}
        onClick={handleChangeMintable}
      >
        {generationData.isMintable ? "Make Unmintable" : "Make Mintable"}
      </Button>
    </div>
  );
};

const FormSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  sellerFeeBasisPoints: z.number().min(0).max(100),
  isMutable: z.boolean(),
  isCollection: z.boolean(),
  nftType: z.enum(["standard", "pNFT", "cNFT"]),
});
type FormTypes = z.infer<typeof FormSchema>;

const formInitialValues: FormTypes = {
  name: "",
  symbol: "",
  description: "",
  imageUrl: "",
  sellerFeeBasisPoints: 10,
  isMutable: true,
  isCollection: false,
  nftType: "standard",
};

export const MintNft = ({ imageUrl }: { imageUrl: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const wallet = useAnchorWallet();

  const form = useForm<FormTypes>({
    validate: zodResolver(FormSchema),
    initialValues: { ...formInitialValues },
  });

  const handleOnSubmit = useCallback(
    async (form: FormTypes) => {
      if (!wallet) {
        toast.error("Please connnect your wallet");
        return;
      }
      if (!form.name) {
        toast.error("Please enter a name for the Nft");
        return;
      }
      if (!form.symbol) {
        toast.error("Please enter a symbol for the nft");
        return;
      }
      setIsLoading(true);
      try {
        const data = {
          name: form.name,
          symbol: form.symbol,
          description: form.description,
          sellerFeeBasisPoints: form.sellerFeeBasisPoints,
          isMutable: form.isMutable,
          image: imageUrl,
        };

        const feeBuilder = await createFeeIx(wallet, form.nftType === "cNFT");
        const metaplex = Metaplex.make(connection).use(
          walletAdapterIdentity(wallet)
        );

        if (form.isCollection && form.nftType === "standard") {
          const collectionBuilder = await createCollectionNft(wallet, data);
          const collectionTx = collectionBuilder.add(feeBuilder);
          const collectionTxInfo = await collectionTx.sendAndConfirm(metaplex);
          console.log({
            mint: collectionTxInfo.mintAddress.toBase58(),
            tx: collectionTxInfo.response.signature,
          });
          try {
            const saveNft = await axios.post("/api/nfts/save/mintedNft", {
              mint: collectionBuilder.getContext().mintAddress.toBase58(),
              wallet: wallet.publicKey.toBase58(),
              uri: imageUrl,
              type: "collection",
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          if (form.nftType === "cNFT") {
            const blockhash = await connection.getLatestBlockhash();
            const { builder, umi } = await mintPrivateCnft(
              wallet,
              imageUrl,
              data.name,
              wallet.publicKey.toBase58(),
              data.description,
              data.sellerFeeBasisPoints,
              data.symbol,
              data.isMutable
            );
            const sendCnftTx = await builder
              .add(
                transferSol(umi, {
                  amount: sol(0.001),
                  destination: fromWeb3JsPublicKey(paymentWallet),
                })
              )
              .sendAndConfirm(umi)
              .then((res) => {
                console.log(
                  `https://solscan.io/tx/${bs58.encode(res.signature)}`
                );
              })
              .catch((err) => {
                throw new Error("Error minting cNFT");
              });

            const saveNft = await axios.post("/api/nfts/save/mintedNft", {
              mint: "cNFT" + Date.now().toString(),
              wallet: wallet.publicKey.toBase58(),
              uri: imageUrl,
              type: "cNFT",
            });
          } else if (form.nftType === "pNFT") {
            const builder = await mintPnftBuilder(wallet, {
              name: form.name,
              symbol: form.symbol,
              description: form.description,
              sellerFeeBasisPoints: form.sellerFeeBasisPoints,
              isMutable: form.isMutable,
              image: imageUrl,
            });
            const tx = await builder.add(feeBuilder).sendAndConfirm(metaplex);
            console.log({
              mint: tx.mintAddress.toBase58(),
              tx: `https://solscan.io/tx/${tx.response.signature}`,
            });
            try {
              const saveNft = await axios.post("/api/nfts/save/mintedNft", {
                mint: tx.mintAddress.toBase58(),
                wallet: wallet.publicKey.toBase58(),
                uri: imageUrl,
                type: "pNFT",
              });
            } catch (err) {
              console.log(err);
            }
          } else {
            const builder = await createStandardNft(wallet, false, data);
            const tx = await builder.add(feeBuilder).sendAndConfirm(metaplex);
            console.log({
              mint: tx.mintAddress.toBase58(),
              tx: `https://solscan.io/tx/${tx.response.signature}`,
            });
            try {
              const saveNft = await axios.post("/api/nfts/save/mintedNft", {
                mint: tx.mintAddress.toBase58(),
                wallet: wallet.publicKey.toBase58(),
                uri: imageUrl,
                type: "Standard",
              });
            } catch (err) {
              console.log(err);
            }
          }
        }
        toast.success("Minted successful!"!);
      } catch (err) {
        console.log(err);
        tryCatchErrorHandler(err);
      }
      setIsLoading(false);
    },
    [wallet, imageUrl]
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.onSubmit(handleOnSubmit)}
    >
      <div className="flex flex-col gap-4">
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
            <p>Collection Nft</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <LuInfo className="text-muted-foreground h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent align="start" className="max-w-xs">
                  This creates a collection NFT that can be used to manage a
                  Metaplex Certified On-Chain Collection.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            checked={
              form.values.nftType === "cNFT" ? false : form.values.isCollection
            }
            onCheckedChange={(c) => form.setFieldValue("isCollection", c)}
            disabled={form.values.nftType === "cNFT"}
          />
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
        <div className="flex flex-col gap-2 my-2">
          <div className="flex items-center gap-2">
            <p>NFT Type</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <LuInfo className="text-muted-foreground h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent align="start" className="max-w-xs">
                  Standard - This creates a standard NFT. Cost: 0.05 Sol
                  <br />
                  pNFT - This creates a pNFT (programmable NFT) that features
                  royalty protection. Cost: 0.05 Sol
                  <br />
                  cNFT - This creates a cNFT (compressed NFT) a cheaper
                  alternative! Cost: 0.001 Sol
                  <br />
                  Defaults to Standard
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={form.values.nftType}
            onValueChange={(v) =>
              form.setFieldValue("nftType", v as "standard" | "pNFT" | "cNFT")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a nft type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>NFT Types</SelectLabel>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pNFT">pNFT</SelectItem>
                <SelectItem value="cNFT">cNFT</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-xs">
            Cost:{" "}
            {form.values.nftType === "standard" ||
            form.values.nftType === "pNFT"
              ? "0.05 Sol"
              : "0.001 Sol"}
          </p>
          {wallet?.publicKey ? (
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              variant={"secondary"}
            >
              Mint
            </Button>
          ) : (
            <ButtonWallet />
          )}
        </div>
      </div>
    </form>
  );
};
