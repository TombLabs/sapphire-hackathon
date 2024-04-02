import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClipboard } from "@mantine/hooks";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LuArrowLeftRight, LuClipboardCopy, LuUnplug } from "react-icons/lu";

export function ButtonWallet({ className = "" }: { className?: string }) {
  const { disconnect } = useWallet();

  const { setVisible } = useWalletModal();
  const wallet = useAnchorWallet();
  const clipboard = useClipboard({ timeout: 500 });
  return (
    <>
      {!wallet ? (
        <Button
          variant={"outline"}
          onClick={() => setVisible(true)}
          className={className}
        >
          Connect Wallet
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} className={className}>
              {wallet?.publicKey?.toString().slice(0, 4) +
                "..." +
                wallet?.publicKey?.toString().slice(-4)}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              className=" cursor-pointer"
              onClick={() => clipboard.copy(wallet?.publicKey)}
            >
              <LuClipboardCopy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className=" cursor-pointer"
              onClick={() => setVisible(true)}
            >
              <LuArrowLeftRight className="mr-2 h-4 w-4" />
              <span>Change Wallet</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className=" cursor-pointer"
              onClick={() => disconnect()}
            >
              <LuUnplug className="mr-2 h-4 w-4" />
              <span>Disconnet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
