import { LayoutBasic } from "@/components/layout/layout-basic";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <div className="fixed flex h-screen w-screen flex-col items-center justify-start overflow-x-auto z-60 bg-[url('/images/bg-patten.webp')]">
      <div className="z-70 flex w-full flex-col items-center justify-center gap-4 px-10 pb-10 pt-16 sm:w-3/4">
        <h1 className="text-4xl font-bold text-white">
          Sapphire Privacy Policy
        </h1>
        <h2 className="text-md text-white">Last updated: 12/29/2023</h2>
        <div className="h-[2px] w-full bg-white/20"></div>
        <h3 className="text-md mt-10 text-center text-white">
          Thank you for visiting Sapphire, operated by Tomb Labs. Your privacy
          is important to us, and we are committed to protecting your personal
          information. This Privacy Policy explains how we collect, use, and
          disclose information about you. By accessing or using our website, you
          consent to the terms outlined in this policy.
        </h3>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">
              Information We Collect
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We may collect information such as:
            </p>
            <ul className="text-md ml-10 mt-6 list-disc gap-2 text-white">
              <li>
                Contact Information: Email address, Discord ID, Twitter ID.
              </li>
              <li>
                Account Information: Email, Discord, Twitter and Solana
                Addresses.
              </li>
              <li>Log Data: Generators, Prompts, and Uploaded Images</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">
              How We Use Your Information
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We use your information for various purposes, including:
            </p>
            <ul className="text-md ml-10 mt-6 list-disc gap-2 text-white">
              <li>Providing and maintaining our services.</li>
              <li>Personalizing your experience.</li>
              <li>Improving your loading times and account history</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">
              Cookies and Similar Technologies
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We use cookies and similar technologies to enhance your experience
              on our website. You can control cookies through your browser
              settings.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">
              Third Party Services
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We may use third-party services for analytics, advertising, and
              other purposes. These services may collect information on our
              behalf. Currently we only use website analytics and collect
              non-personal data on website performance.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">Information Sharing</p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We do not sell, trade, or otherwise transfer your personal
              information to outside parties, unless explicity required by law.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">Security</p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We implement security measures to protect your information.
              However, no method of transmission over the internet is entirely
              secure.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">Your Choice</p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              Social connections and wallets may be updated or removed on the
              site at any time. If you would like to delete your account or need
              to update any part of your data that is not available on the site,
              please contact us (Contact Information at the Bottom)
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">
              Privacy Policy Updates
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              We may update this Privacy Policy from time to time. The date of
              the latest revision will be indicated at the top of the page.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col items-start justify-start gap-2">
          <div className="flex w-full flex-row items-end justify-start gap-2">
            <img src="/sapphire_white.png" height={28} width={28} />
            <p className=" text-left text-xl text-white">Contact Us</p>
          </div>
          <div className="h-[2px] w-full bg-white/20"></div>
          <div className="ml-10 mt-4 gap-6">
            <p className="text-md text-white">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <Link href="mailto:support@sapphiretool.io">
                <span className="text-lg underline">
                  support@sapphiretool.io
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

PrivacyPolicy.getLayout = function getLayout(page: React.ReactElement) {
  return <LayoutBasic>{page}</LayoutBasic>;
};
