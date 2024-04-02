import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/useUserHooks";
import { NAV_MENU_SECTIONS } from "@/lib/constants/nav-menu";
import { SOCIALS } from "@/lib/constants/socials";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import {
  LuChevronDown,
  LuDiamond,
  LuLogOut,
  LuMenu,
  LuMoon,
  LuRefreshCcw,
  LuServerOff,
  LuSettings,
  LuSun,
  LuX,
} from "react-icons/lu";
import { ButtonWallet } from "./button-wallet";

export function NavBar() {
  const { pathname, asPath } = useRouter();
  const { setTheme, theme } = useTheme();
  const { data: user, isError, mutate } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItemName, setActiveItemName] = useState("");

  useEffect(() => {
    setIsMenuOpen(false);
  }, [asPath]);

  return (
    <nav className="xl:relative z-50 sticky top-0">
      <section className="xl:hidden sticky h-16 top-0 flex gap-4 p-4 bg-background justify-between border-b-[1px] border-b-border items-center">
        <Button
          size={"icon"}
          variant={"ghost"}
          className="h-8 w-8"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <LuMenu
            className={`w-6 h-6 transition-all ${
              isMenuOpen ? "rotate-180 scale-0" : ""
            }`}
          />
          <LuX
            className={`w-6 h-6 transition-all absolute ${
              !isMenuOpen ? "-rotate-180 scale-0" : ""
            }`}
          />
          <span className="sr-only">menu</span>
        </Button>

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
              width={52}
              height={52}
            />
          )}
        </Link>

        <Link href={"/purchase"}>
          <Badge
            className="font-normal border-primary gap-1 hover:bg-primary"
            variant={"outline"}
          >
            <LuDiamond /> {user?.sapphires || 0}
          </Badge>
        </Link>
      </section>

      <aside
        className={`transition-all fixed left-0 bottom-0 xl:top-0 top-16 xl:w-64 w-full xl:flex flex-col border-r-border border-r-[1px] overflow-auto bg-background ${
          isMenuOpen ? "flex" : "hidden"
        }`}
      >
        <section className="xl:flex items-center p-4 hidden h-16">
          <Link href={"/"} className="mx-auto">
            {theme == "light" ? (
              <Image
                src="/sapphire_black.png"
                alt="sapphire-logo"
                width={60}
                height={60}
              />
            ) : (
              <Image
                src="/sapphire_white.png"
                alt="sapphire-logo"
                width={60}
                height={60}
              />
            )}
          </Link>
        </section>

        <section className="p-4 flex flex-col gap-6 items-center py-12 relative overflow-hidden shrink-0 border-y border-y-border">
          {!!user?.image && (
            <Image
              src={user.image}
              alt="background-image"
              fill
              className="blur scale-110 h-full w-full object-cover absolute inset-0 -z-10 opacity-20"
            />
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="absolute top-4 left-4 cursor-pointer">
                <LuLogOut className="h-4 w-4" onClick={() => signOut()} />
                <span className="sr-only">sign out</span>
              </TooltipTrigger>
              <TooltipContent>Sign Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="absolute top-4 right-4">
                <Link href={"/settings"}>
                  <LuSettings className="h-4 w-4" />
                  <span className="sr-only">settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-col items-center gap-2">
            {isError ? (
              <div className="cursor-pointer flex items-center flex-col gap-2">
                <LuServerOff className="w-6 h-6" />
                <p className="text-center">Oops, something went wrong</p>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  onClick={() => mutate()}
                  className="text-xs"
                >
                  <LuRefreshCcw /> Refresh
                </Button>
              </div>
            ) : !user ? (
              <>
                <Skeleton className="rounded-full w-16 h-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </>
            ) : (
              <>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image} alt="avatar" />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                  <Link
                    href={"/settings/general"}
                    className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center hover:opacity-100 opacity-0 transition-all cursor-pointer"
                  >
                    Edit
                  </Link>
                </Avatar>

                <p className="text-base">{user.name}</p>

                <Link href={"/purchase"}>
                  <Badge
                    className="font-normal border-primary gap-1 hover:bg-primary"
                    variant={"outline"}
                  >
                    <LuDiamond /> {user.sapphires || 0}
                  </Badge>
                </Link>
              </>
            )}
          </div>

          <ButtonWallet />
          {user?.role === "admin" || user?.role === "super admin" ? (
            <Link href={"/admin"} className="-mb-8 w-full">
              <Button
                variant={"default"}
                className="text-xs justify-center w-full h-6"
              >
                Admin Panel
              </Button>
            </Link>
          ) : null}
        </section>

        <section className="p-4 pb-16 flex flex-col">
          {NAV_MENU_SECTIONS.map((_section, i) => (
            <div
              key={`menu-section-${i}`}
              className="border-b last:border-b-0 py-2 first:pt-0 last:pb-0"
            >
              {_section.map((_item, i) => (
                <div key={`item-${i}`} className="flex flex-col">
                  <div>
                    {!!_item.href ? (
                      <Link
                        href={_item.href}
                        onClick={() => setActiveItemName(_item.name)}
                      >
                        <Button
                          variant={_item.href == pathname ? "default" : "ghost"}
                          className=" justify-start w-full whitespace-nowrap font-alleynpro font-normal"
                        >
                          <_item.icon className="shrink-0" />
                          {_item.name}
                          {_item.subItems.length > 0 && (
                            <LuChevronDown
                              className={`"h-4 w-4 ml-auto transition-all shrink-0 ${
                                _item.name == activeItemName ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant={_item.href == pathname ? "default" : "ghost"}
                        className=" justify-start w-full whitespace-nowrap font-alleynpro font-normal"
                        onClick={() => setActiveItemName(_item.name)}
                      >
                        <_item.icon className="shrink-0" />
                        {_item.name}
                        {_item.subItems.length > 0 && (
                          <LuChevronDown
                            className={`"h-4 w-4 ml-auto transition-all shrink-0 ${
                              _item.name == activeItemName ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    )}
                  </div>

                  <motion.div
                    initial={false}
                    animate={
                      _item.name == activeItemName && _item.subItems.length > 0
                        ? { height: "auto" }
                        : { height: "0px" }
                    }
                    className="w-full pl-8 overflow-hidden"
                  >
                    {_item.subItems.map((_subItems) => (
                      <Link key={_subItems.name} href={_subItems.href}>
                        <Button
                          key={_subItems.name}
                          size={"sm"}
                          variant={
                            _subItems.href == pathname ? "default" : "ghost"
                          }
                          className=" justify-start w-full text-xs"
                        >
                          {_subItems.name.includes("(Coming Soon)") ? (
                            <>
                              <span>
                                {_subItems.name.split("(Coming Soon)")[0]}
                              </span>
                              <span className="text-[8px] text-neutral-400">
                                Coming Soon
                              </span>
                            </>
                          ) : (
                            _subItems.name
                          )}
                        </Button>
                      </Link>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="mt-auto flex flex-col gap-4 p-4">
          <div className="flex gap-4 items-center justify-center mx-auto">
            <Link href={SOCIALS.x} target="_blank">
              <FaXTwitter className="h-4 w-4" />
              <span className="sr-only">twitter</span>
            </Link>
            <Link href={SOCIALS.discord} target="_blank">
              <FaDiscord className="h-5 w-5" />
              <span className="sr-only">discord</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-muted mx-auto rounded-2xl">
            <Button
              size={"sm"}
              className="text-xs h-6 dark:bg-primary dark:hover:bg-primary/90"
              variant={"ghost"}
              onClick={() => setTheme("dark")}
            >
              <LuMoon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              size={"sm"}
              className="text-xs h-6 dark:bg-muted"
              variant={"default"}
              onClick={() => setTheme("light")}
            >
              <LuSun className="h-4 w-4" />
              Light
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Made by Tomb Labs @2023 Sapphire
          </div>
          <Link
            href="/policy/privacy-policy"
            className="text-center text-xs text-muted-foreground -mt-4"
          >
            Privacy Policy
          </Link>
        </section>
      </aside>
    </nav>
  );
}
