import {
  LuBot,
  LuDiamond,
  LuGavel,
  LuHammer,
  LuHelpCircle,
  LuImage,
  LuMicroscope,
  LuScroll,
  LuTicket
} from "react-icons/lu";

export const NAV_MENU_SECTIONS = [
  [
    {
      name: "Explore",
      icon: LuMicroscope,
      href: "/explore",
      subItems: [],
    },
    {
      name: "My Generations",
      icon: LuImage,
      href: "/generations",
      subItems: [],
    },
    {
      name: "Auctions",
      icon: LuGavel,
      href: "/auctions",
      addedAt: 0,
      subItems: [],
    },
    {
      name: "Generate Image",
      icon: LuBot,
      href: "",
      subItems: [
        { name: "Dalle 3", href: "/generate/dalle" },
        { name: "Leonardo", href: "/generate/leonardo" },
        { name: "Stability", href: "/generate/stability" },

      ],
    },
    {
      name: "Web3 Tools",
      icon: LuHammer,
      href: "",
      subItems: [
        { name: "Burn for Sapphires", href: "/tools/burn" },
        { name: "Swap for Sapphires", href: "/tools/swap" },
        { name: "Edit NFTs (Coming Soon)", href: "" },
        { name: "Manage Collections (Coming Soon)", href: "" },
      ]
    }
  ],

  [
    {
      name: "Purchase Sapphires",
      icon: LuDiamond,
      href: "/purchase",

      subItems: [],
    },
    {
      name: "Redeem Code",
      icon: LuTicket,
      href: "/redeem-code",
      subItems: [],
    },
  ],
  [
    {
      name: "News & Updates",
      icon: LuScroll,
      href: "/news-and-updates",
      subItems: [],
    },
    {
      name: "FAQs",
      icon: LuHelpCircle,
      href: "/faqs",
      subItems: [],
    },
  ],
];
