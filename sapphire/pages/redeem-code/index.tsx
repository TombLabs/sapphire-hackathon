import { LayoutBasic } from "@/components/layout/layout-basic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { tryCatchErrorHandler } from "@/lib/helpers/utils";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { motion } from "framer-motion";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useState } from "react";
import Confetti from "react-confetti";
import toast from "react-hot-toast";

export default function RedeemCodePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const { height, width } = useViewportSize();

  const handleOnRedeemClick = async () => {
    if (!code) {
      toast.error("Please enter a redeem code");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/voucher", {
        code: code,
      });
      setRedeemAmount(data.amount);
      setIsRedeemed(true);
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsLoading(false);
  };

  return (
    <>
      <NextSeo title="Redeem Code" />
      {isRedeemed ? (
        <motion.div
          key={"complete"}
          initial={{ opacity: 0, y: "10px" }}
          animate={{ opacity: 1, y: "0px" }}
          transition={{ duration: 0.75 }}
          className=" flex flex-col gap-8 max-w-md w-full"
        >
          <section className="text-center space-y-2">
            <h1>{redeemAmount} Sapphires Redeemed</h1>
            <p className="text-muted-foreground">
              Sapphires have been successfully credited into your account.
            </p>
          </section>

          <Button
            onClick={() => {
              setRedeemAmount(0);
              setIsRedeemed(false);
            }}
            className="mx-auto"
          >
            Enter another code
          </Button>
        </motion.div>
      ) : (
        <div key={"redeem"} className=" flex flex-col gap-8 max-w-sm w-full">
          <section className="text-center space-y-2">
            <h1>Got a Redeem Code?</h1>
            <p className="text-muted-foreground">
              Enter the code below to claim your free sapphires.
            </p>
          </section>

          <section className="gap-2 grid">
            <Input
              disabled={isLoading}
              placeholder="Enter Code Here"
              value={code}
              className="text-center border-primary"
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              isLoading={isLoading}
              disabled={isLoading || !code}
              onClick={handleOnRedeemClick}
            >
              Redeem
            </Button>
          </section>

          {!isLoading && (
            <>
              <section className="flex gap-4 items-center">
                <Separator className="w-auto grow" />
                <p className="text-xs">OR</p>
                <Separator className="w-auto grow" />
              </section>

              <Link href={"/purchase"} className="grid">
                <Button disabled={isLoading} variant={"outline"}>
                  Purchase Sapphires
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none">
        <Confetti
          width={width}
          height={height}
          style={{ pointerEvents: "none" }}
          numberOfPieces={!!redeemAmount ? 1000 : 0}
          recycle={false}
          onConfettiComplete={(confetti) => {
            if (confetti) confetti.reset();
          }}
        />
      </div>
    </>
  );
}

RedeemCodePage.getLayout = function getLayout(page: React.ReactElement) {
  return <LayoutBasic>{page}</LayoutBasic>;
};
