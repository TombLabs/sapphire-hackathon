import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUserHooks";
import { sidebarItems } from "@/lib/constants/admin-sidebar";
import { AdminComponent } from "@/pages/admin";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";

type SidebarProps = {
  activeComponent: AdminComponent;
  setActiveComponent: Dispatch<SetStateAction<AdminComponent>>;
};

export default function Sidebar({
  activeComponent,
  setActiveComponent,
}: SidebarProps) {
  const { setTheme, theme } = useTheme();
  const { data: user, isError, mutate } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItemName, setActiveItemName] = useState("");

  return (
    <>
      {!isMenuOpen && (
        <section className="absolute top-2 right-2 z-60 flex justify-center items-center">
          {!isMenuOpen && <span>Admin</span>}
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
          </Button>
          <span className="sr-only">menu</span>
        </section>
      )}
      <nav
        className={`z-50 fixed top-0 w-60 h-screen right-0 ${
          !isMenuOpen && "hidden"
        } flex flex-col justify-start items-start bg-background p-4 border-l-[1px] border-blue-border`}
      >
        <section className="absolute top-2 left-2">
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
        </section>

        <section className="flex flex-col items-center justify-center w-full py-4 border-b-2 mb-2 border-border">
          <p className="text-2xl font-bold">Admin Nav</p>
        </section>
        <section className="p-4 pb-16 flex flex-col">
          {sidebarItems?.map((_item, i) => (
            <div key={`item-${i}`} className="flex flex-col">
              <div>
                {!!_item.name ? (
                  <>
                    <Button
                      variant={_item === activeComponent ? "default" : "ghost"}
                      className=" justify-start w-full whitespace-nowrap font-alleynpro font-normal"
                      onClick={() => {
                        setActiveComponent(_item);
                        setIsMenuOpen(false);
                      }}
                    >
                      <_item.icon className="shrink-0" />
                      {_item.name}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={_item == activeComponent ? "default" : "ghost"}
                    className=" justify-start w-full whitespace-nowrap font-alleynpro font-normal"
                    onClick={() => setActiveItemName(_item.name)}
                  >
                    <_item.icon className="shrink-0" />
                    {_item.name}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </section>
      </nav>
    </>
  );
}
