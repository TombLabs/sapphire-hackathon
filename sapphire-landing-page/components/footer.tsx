import { Divider, Link } from "@nextui-org/react";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer>
      <div className="relative mx-auto w-full max-w-screen-2xl">
        <div className="flex items-center justify-between gap-6 p-6">
          <Link color="foreground" href="/" className="gap-2">
            <img width={25} height={32} alt="Sapphire" src="/logo-icon.png" />
          </Link>{" "}
          <div>
            <Link
              color="foreground"
              href="https://twitter.com/SapphireTool"
              className="gap-2"
              isExternal
            >
              <FaXTwitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>

        <p className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap p-6 text-center text-sm">
          @ 2023 Sapphire.{" "}
          <span className="hidden sm:inline">All rights reserved. </span>
          <Link
            href="/policy/privacy-policy"
            className="text-sm text-white underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
