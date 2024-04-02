import { NextSeo } from "next-seo";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

const settingItems = [
  { name: "General", href: "/settings/general" },
  { name: "Manage Wallets", href: "/settings/wallets" },
  { name: "Link Socials", href: "/settings/socials" },
];

export default function SettingsPage() {
  return (
    <>
      <NextSeo title="Account Settings" />
      <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full py-16">
        <h2>Account Settings</h2>

        <div className="border rounded-xl overflow-hidden grid">
          {settingItems.map((_item) => (
            <Link
              href={_item.href}
              key={_item.name}
              className="p-4 text-base group hover:bg-accent transition-all border-b flex justify-between gap-4 last:border-b-0"
            >
              {_item.name}
              <LuChevronRight className="h-6 w-6 group-hover:-mr-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
