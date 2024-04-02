import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { MyButton } from "./ui/button";

export function Navigation() {
  return (
    <Navbar shouldHideOnScroll maxWidth={"2xl"}>
      <NavbarBrand>
        <Link color="foreground" href="/" className="gap-2">
          <img width={50} height={50} alt="Sapphire" src="/logo-icon.png" />
          <p className="font-bold text-white">SAPPHIRE</p>
        </Link>
      </NavbarBrand>

      {/* <NavbarContent className="hidden gap-8 sm:flex" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#" className="text-white">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#" className="text-white">
            Learn
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#gallery" className="text-white">
            Gallery
          </Link>
        </NavbarItem>
      </NavbarContent> */}

      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <Link href="https://app.sapphiretool.io" isExternal>
            <MyButton color="primary" variant="shadow">
              Launch App
            </MyButton>
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
