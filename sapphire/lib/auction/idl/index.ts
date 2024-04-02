import * as anchor from "@coral-xyz/anchor"

const IDL = {
  version: "0.1.0",
  name: "sapphire_auctions",
  instructions: [
    {
      name: "initSapphireAuctions",
      accounts: [
        {
          name: "sapphireAuctions",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "fee",
          type: "u8"
        }
      ]
    },
    {
      name: "updateFee",
      accounts: [
        {
          name: "sapphireAuctions",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        }
      ],
      args: [
        {
          name: "fee",
          type: "u8"
        }
      ]
    },
    {
      name: "updateFeeWallet",
      accounts: [
        {
          name: "sapphireAuctions",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        }
      ],
      args: []
    },
    {
      name: "initAuction",
      accounts: [
        {
          name: "auction",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "creator",
          isMut: true,
          isSigner: true
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "nftMint",
          isMut: true,
          isSigner: false
        },
        {
          name: "creatorTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "startPrice",
          type: "u64"
        },
        {
          name: "minBid",
          type: "u64"
        },
        {
          name: "endTime",
          type: "i64"
        }
      ]
    },
    {
      name: "bidOnAuction",
      accounts: [
        {
          name: "auction",
          isMut: true,
          isSigner: false
        },
        {
          name: "bidder",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "bidderTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "nftMint",
          isMut: true,
          isSigner: false
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        }
      ],
      args: [
        {
          name: "bid",
          type: "u64"
        }
      ]
    },
    {
      name: "closeAuction",
      accounts: [
        {
          name: "auction",
          isMut: true,
          isSigner: false
        },
        {
          name: "sapphireAuctions",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "creator",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "nftMint",
          isMut: true,
          isSigner: false
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false
        },
        {
          name: "winner",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
          docs: [
            "CHECK"
          ]
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "SapphireAuctions",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey"
          },
          {
            name: "feeWallet",
            type: "publicKey"
          },
          {
            name: "fee",
            type: "u8"
          },
          {
            name: "bump",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "Auction",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "publicKey"
          },
          {
            name: "nftEscrow",
            type: "publicKey"
          },
          {
            name: "bumps",
            type: {
              "defined": "AuctionBumps"
            }
          },
          {
            name: "nftMint",
            type: "publicKey"
          },
          {
            name: "creatorTokenAccount",
            type: "publicKey"
          },
          {
            name: "startPrice",
            type: "u64"
          },
          {
            name: "minBid",
            type: "u64"
          },
          {
            name: "endTime",
            type: "i64"
          },
          {
            name: "winner",
            type: "publicKey"
          },
          {
            name: "highestBid",
            type: {
              "defined": "HighestBid"
            }
          },
          {
            name: "previousHighBid",
            type: {
              "defined": "ReplacedBidder"
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "AuctionBumps",
      type: {
        kind: "struct",
        fields: [
          {
            name: "auctionStateBump",
            type: "u8"
          },
          {
            name: "nftEscrowBump",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "HighestBid",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bidder",
            type: "publicKey"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "bidderTokenAccount",
            type: "publicKey"
          }
        ]
      }
    },
    {
      name: "ReplacedBidder",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bidder",
            type: "publicKey"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "bidderTokenAccount",
            type: "publicKey"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidStage"
    },
    {
      code: 6001,
      name: "InsufficientFunds",
      msg: "Insufficient Funds"
    },
    {
      code: 6002,
      name: "InvalidNFT",
      msg: "Invalid Nft"
    },
    {
      code: 6003,
      name: "InvalidCreator",
      msg: "Invalid Creator"
    },
    {
      code: 6004,
      name: "InvalidBid",
      msg: "Invalid Bid"
    },
    {
      code: 6005,
      name: "InvalidFeeWallet",
      msg: "Incorrect Fee Wallet"
    },
    {
      code: 6006,
      name: "InvalidAuthority",
      msg: "Invalid Authority"
    },
    {
      code: 6007,
      name: "InvalidMint",
      msg: "Invalid token mint address"
    },
    {
      code: 6008,
      name: "BidTooLow",
      msg: "Bid was below the minimum bid"
    }
  ],
  metadata: {
    address: "SAPPozsZ9dApKRx4n4aMipFZ4pvH2QY9JmfLbks1UXo"
  }
} as anchor.Idl

export default IDL