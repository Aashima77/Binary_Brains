'use client';
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { GithubIcon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import {
  Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link,
  Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu,
  NavbarMenuItem, NavbarMenuToggle,
} from "@heroui/react";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <HeroUINavbar
      height="64px"
      isBordered={true}
      maxWidth="full"
      position="sticky"
    >
      <NavbarBrand as="li" className="gap-3 max-w-fit">
        <NextLink className="flex justify-start items-center gap-1" href="/">
          <p className="font-bold text-inherit">Vision AI</p>
        </NextLink>
      </NavbarBrand>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="center">
        <ul className="hidden lg:flex justify-start gap-4 ml-2">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <NavbarItem key={item.href}>
                <NextLink
                  className={`px-4 py-1.5 rounded-full transition-colors ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-default-100'
                    }`}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-4">
          <ThemeSwitch />
          {pathname !== '/login' && pathname !== '/signup' && pathname !== '/' ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name="User"
                  size="sm"
                  src="https://avatar.iran.liara.run/public/44"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" as={NextLink} href="/profile">
                  Profile
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link isExternal aria-label="Github" href={siteConfig.links.github}>
              <GithubIcon className="text-default-500" />
            </Link>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden pl-4 basis-1" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="flex flex-col gap-2 mx-4 mt-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NextLink href={item.href}>{item.label}</NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};

