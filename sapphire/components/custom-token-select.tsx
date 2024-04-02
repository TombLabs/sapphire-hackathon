import { SwappableTokens } from "@/types";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Input } from "./ui/input";

type CustomTokenSelectProps = {
  selectedToken: SwappableTokens;
  setSelectedToken: Dispatch<SetStateAction<SwappableTokens>>;
  swappableTokens: SwappableTokens[];
  tokenAmount: number;
  setTokenAmount: Dispatch<SetStateAction<number>>;
};

const CustomTokenSelect = ({
  selectedToken,
  setSelectedToken,
  swappableTokens,
  setTokenAmount,
  tokenAmount,
}: CustomTokenSelectProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-full flex flex-col justify-center items-center relative`}
    >
      <div className="flex flex-row justify-center items-start w-full gap-2 mt-4">
        <div
          className={`w-3/4 p-2 flex items-center gap-4 justify-start rounded-xl border-white/10 border-[1px] h-10 bg-background relative`}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {selectedToken ? (
            <>
              <img
                src={selectedToken?.image}
                alt={selectedToken?.name}
                className="w-6 h-6 rounded-md"
              />
              <p className="text-xs">{selectedToken?.symbol}</p>
              <p className="text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedToken?.name}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute right-2 h-7 w-7 rounded-full"
                type="button"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <p className="text-xs">Select Token</p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute right-2 h-7 w-7 rounded-full"
                type="button"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-14 mt-1 w-1/2 flex flex-col bg-background border-white/10 border-[1px] overflow-y-auto h-72"
          >
            {swappableTokens?.map((token) => (
              <div
                className="w-full p-4 flex items-center gap-4 justify-start h-12 bg-background hover:bg-muted cursor-pointer"
                key={token.mint}
                onClick={() => {
                  setTokenAmount(0);
                  setSelectedToken(token);
                  setIsExpanded(false);
                }}
              >
                {selectedToken?.mint === token.mint ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                <img
                  src={token.image}
                  alt={token.name}
                  className="w-8 h-8 rounded-md"
                />
                <p className="text-xs whitespace-nowrap">{token.symbol}</p>
                <p className="text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  {token.name}
                </p>
              </div>
            ))}
          </motion.div>
        )}
        <div className="flex flex-col justify-center items-end w-1/2 relative">
          {tokenAmount > selectedToken?.balance && (
            <p className="absolute -top-6 text-[11px] text-red-600">
              Insufficent Balance
            </p>
          )}
          <Input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(parseFloat(e.target.value))}
            className={`w-full ${
              tokenAmount > selectedToken?.balance && `ring-2 ring-red-600`
            }`}
          />
          <div className="flex flex-row justify-between items-center w-full">
            <p className="text-[11px] text-muted-foreground">
              Balance: {selectedToken?.balance}
            </p>
            <p
              className="text-[11px] text-muted-foreground cursor-pointer p-1 border-[1px] border-blue-900/20 rounded-lg"
              onClick={() => setTokenAmount(selectedToken?.balance)}
            >
              Max
            </p>
            <p
              className="text-[11px] text-muted-foreground cursor-pointer p-1 border-[1px] border-blue-900/20 rounded-lg"
              onClick={() => setTokenAmount(selectedToken?.balance / 2)}
            >
              Half
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTokenSelect;
