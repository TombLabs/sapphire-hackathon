<a href="https://tombstoned.app/">
    <img src="https://www.tombstoned.app/logo.webp" alt="TombStoned logo" title="TombStoned" align="right" height="60" />
</a>

# Tomb Labs Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Star us on GitHub — it motivates us a lot!

Badges is an on-chain system for adding community badges for your users. It harnesses the power of SFT(Semi-Fungible Tokens) to reward users for engaging with, using and contributing to your project/platform. By using Tokens, we can empower the user via ownership of their badge. They can choose to keep the badge in their wallet, sell it, trade it or keep it locked on the program account created for them.

Keep in mind this is the first iteration and will continue to adapt and improve as we get feedback from the community.

Please feel free to contribute or raise any issues you find!

## Information

Currently deployed on Devnet at the following address: BADGEDniMk3LxR5JgHjyFKnSQhNYiXr5etsuzTFCTd1S

Mainnet Launch will feature a front end for managing projects.

We have written a Typescript SDK for interacting with the badges program. You can find it [here](https://github.com/TombLabs/badges-typescript-sdk).

## Features

- Create a project for your NFT project
- You control all the badges. You can create, delete, update and allocate them
- The program mainly handles accounts and storage, allowing you to handle the criteria for awarding badges
- Users can choose to claim their badges or keep them locked in the program account
- Initial space allocated for 20 badges per project (expanable in future releases)
- User accounts are free for the user to create (project pays the account fees, but you can pass this on to the user if you wish)

## Deploying your own badges program

- This will cost around 4 SOL to deploy

1. Clone the repo
2. Install the Anchor CLI [here](https://www.anchor-lang.com/docs/installation)
3. CD into the badges_program directory
4. Build the program `anchor build`
5. Add your keypair, program address and RPC to the Anchor.toml file
6. Add the program address to the declare_id macro in the `program/src/lib.rs` file
7. Deploy the program `anchor deploy`
