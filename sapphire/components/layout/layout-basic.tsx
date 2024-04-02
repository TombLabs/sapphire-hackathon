import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { LuChevronLeft } from "react-icons/lu";
import { ButtonWallet } from "../button-wallet";

export const LayoutBasic = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 flex bg-background items-center gap-4 h-16">
        <Link href={"/explore"}>
          <Button variant="outline" size={"icon"}>
            <LuChevronLeft className="h-6 w-6" />
            <span className="sr-only">back</span>
          </Button>
        </Link>

        <Link href={"/"} className="absolute left-1/2 -translate-x-1/2">
          {theme == "light" ? (
            <Image
              src="/sapphire_black.png"
              alt="sapphire-logo"
              width={52}
              height={52}
            />
          ) : (
            <Image
              src="/sapphire_white.png"
              alt="sapphire-logo"
              width={44}
              height={44}
            />
          )}
        </Link>

        <ButtonWallet className="ml-auto" />
      </nav>

      <main className="grow flex items-center justify-center sm:px-12 px-6 py-24">
        {children}
      </main>
    </div>
  );
};
