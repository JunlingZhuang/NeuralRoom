"use client";
import HyperText from "@/components/ui/hyper-text";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";

export const links = [
  { name: "Explore", href: "/explore" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Research", href: "/research" },
];

export default function NavBars() {
  const pathname = usePathname();

  return (
    <Navbar
      height="2rem"
      maxWidth="full"
      classNames={{
        brand: ["text-white"],
        base: ["bg-black"],
        item: [
          "flex",
          "h-full",
          "relative",
          "text-large",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-[2px]",
          "data-[active=true]:after:bg-primary",
        ],
      }}
    >
      <NavbarBrand>
        <HyperText
          className="text-4xl font-bold text-black dark:text-white"
          text="NeuralRoom"
        />
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-20" justify="center">
        {links.map((link) => (
          <NavbarItem key={link.href} isActive={pathname === link.href}>
            <Link color="foreground" href={link.href}>
              {link.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
    </Navbar>
  );
}
