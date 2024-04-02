<a href="https://tombstoned.app/">
    <img src="https://www.tombstoned.app/logo.webp" alt="TombStoned logo" title="TombStoned" align="right" height="60" />
</a>

# Tomb Labs Badges SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Star us on GitHub — it motivates us a lot!

This is a rudimentary SDK for interacting with the Tomb Labs Badges program. It is written in typescript and should have all necessary functions for interacting with the program. This SDK will be updated as the program is updated.

You can find the Program source code [here](https://github.com/TombLabs/badges).

## Installation

```bash
npm install @tomblabs/badges-sdk
or
yarn add @tomblabs/badges-sdk
```

## Usage

Initialize the badges class with the signer, RPC Endpoint and commitment level.

Node JS Example:

```typescript
import { Badges } from "@tomblabs/badges-sdk";
import { Keypair } from "@solana/web3.js";

const keypairFile = JSON.parse(
  fs.readFileSync("path/to/keypair.json", "utf-8")
);
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairFile));
const rpcEndpoint = "https://api.devnet.solana.com";
const commitment = "confirmed";

const badges = new Badges(keypair, rpcEndpoint, commitment);
```

React Example:

```typescript
import { Badges } from "@tomblabs/badges-sdk";
import { useWallet } from "@solana/wallet-adapter-react";

const BadgeExample = () => {
  const wallet = useWallet();
  const RPC_ENDPOINT = "https://api.devnet.solana.com";
  const badges = new Badges(wallet, RPC_ENDPOINT, "finalized");
};
```

## Instructions

### Project

**createProject**

_Project Authority is Signer_

```typescript
const feeInLamports = 1000000;
const collectionAddress = new PublicKey("your collection mint address");
const feeAddress = new PublicKey("your fee address");

//Creates a project and returns a Transaction Signature or an Error
const createProject = await badges.createProject(
  feeInLamports,
  collectionAddress,
  "Project Name",
  feeAddress
);

//Gets the transaction for creating a project
const createProjectTx = await badges.getCreateProjectTx(
  feeInLamports,
  collectionAddress,
  "Project Name",
  feeAddress
);
```

**changeProjectName**

_Project Authority is Signer_

```typescript
const newName = "New Project Name";
const collectionAddress = new PublicKey("your collection mint address");

//Changes the name for a project and returns a Transaction Signature or an Error
const changeProjectName = await badges.changeProjectName(
  newName,
  collectionAddress
);

//Gets the transaction for changing the project name
const changeProjectNameTx = await badges.getChangeProjectNameTx(
  newName,
  collectionAddress
);
```

**changeProjectFeeWallet**

_Project Authority is Signer_

```typescript
const newFeeWallet = new PublicKey("your new fee wallet address");
const collectionAddress = new PublicKey("your collection mint address");

//Changes the fee wallet for a project and returns a Transaction Signature or an Error
const changeFeeWallet = await badges.changeFeeWallet(
  newFeeWallet,
  collectionAddress
);

//Gets the transaction for changing the project fee wallet
const changeFeeWalletTx = await badges.getChangeProjectNameTx(
  newFeeWallet,
  collectionAddress
);
```

**changeProjectFee**

_Project Authority is Signer_

```typescript
const newFeeInLamports = 1000000;
const collectionAddress = new PublicKey("your collection mint address");

//Changes the fee for a project and returns a Transaction Signature or an Error
const changeProjectFee = await badges.changeProjectFee(
  newFeeInLamports,
  collectionAddress
);

//Gets the transaction for changing the project fee
const changeProjectFeeTx = await badges.getChangeProjectFeeTx(
  newFeeInLamports,
  collectionAddress
);
```

**deleteProject**

_Project Authority is Signer_

```typescript
const collectionAddress = new PublicKey("your collection mint address");

//Deletes a project and returns a Transaction Signature or an Error
const deleteProject = await badges.deleteProject(collectionAddress);

//Gets the transaction for deleting a project
const deleteProjectTx = await badges.getDeleteProjectTx(collectionAddress);
```

### Badges

**createBadge**

_Project Authority is Signer_

```typescript
const name = "Badge Name";
const metadataUri = "https://yourmetadatauri.com";
const imageUri = "https://yourimageuri.com";
const royalty = 10;
const collectionAddress = new PublicKey("your collection mint address");

//Creates a badge and returns a Transaction Signature or an Error
const createBadge = await badges.createBadge(
  name,
  metadataUri,
  imageUri,
  royalty,
  collectionAddress
);

//Gets the transaction for creating a badge
const createBadgeTx = await badges.getCreateBadgeTx(
  name,
  metadataUri,
  imageUri,
  royalty,
  collectionAddress
);
```

**deleteBadge**

_Project Authority is Signer_

```typescript
const mint = new PublicKey("your badge mint address");
const collectionAddress = new PublicKey("your collection mint address");

//Deletes a badge and returns a Transaction Signature or an Error
const deleteBadge = await badges.deleteBadge(mint, collectionAddress);

//Gets the transaction for deleting a badge
const deleteBadgeTx = await badges.getDeleteBadgeTx(mint, collectionAddress);
```

**addBadgeToUser**

_Project Authority is Signer_

```typescript
const userAccountAuthority = new PublicKey("your user account authority");
const userAccountInitializer = new PublicKey("your user account initializer");
const mint = new PublicKey("your badge mint address");
const collectionAddress = new PublicKey("your collection mint address");

//Adds a badge to a user and returns a Transaction Signature or an Error
const addBadgeToUser = await badges.addBadgeToUser(
  userAccountAuthority,
  userAccountInitializer,
  mint,
  collectionAddress
);

//Gets the transaction for adding a badge to a user
const addBadgeToUserTx = await badges.getAddBadgeToUserTx(
  userAccountAuthority,
  userAccountInitializer,
  mint,
  collectionAddress
);
```

**withdrawBadge**

_User Authority is Signer_

```typescript
const userAccountInitializer = new PublicKey("your user account initializer");
const mint = new PublicKey("your badge mint address");
const collectionAddress = new PublicKey("your collection mint address");
const projectAuth = new PublicKey("your project authority");

//Withdraws a badge from a user and returns a Transaction Signature or an Error
const withdrawBadge = await badges.withdrawBadge(
  userAccountInitializer,
  mint,
  collectionAddress,
  projectAuth
);

//Gets the transaction for withdrawing a badge from a user
const withdrawBadgeTx = await badges.getWithdrawBadgeTx(
  userAccountInitializer,
  mint,
  collectionAddress,
  projectAuth
);
```

### User Accounts

**createUserAccount**

_Project Authority is Signer_

```typescript
const dbId = "your database id"; //Optional Database Identifier
const collectionAddress = new PublicKey("your collection mint address");
const userWallet = new PublicKey("your user wallet address");

//Creates a user account and returns a Transaction Signature or an Error
const createUserAccount = await badges.createUserAccount(
  dbId,
  collectionAddress,
  userWallet
);

//Gets the transaction for creating a user account
const createUserAccountTx = await badges.getCreateUserAccountTx(
  dbId,
  collectionAddress,
  userWallet
);
```

**deleteUserAccount**

_User Authority is Signer_

```typescript
const initializer = new PublicKey("your user  account initializer");
const collectionAddress = new PublicKey("your collection mint address");
const projectAuth = new PublicKey("your project authority");

//Deletes a user account and returns a Transaction Signature or an Error
const deleteUserAccount = await badges.deleteUserAccount(
  initializer,
  collectionAddress,
  projectAuth
);

//Gets the transaction for deleting a user account
const deleteUserAccountTx = await badges.getDeleteUserAccountTx(
  initializer,
  collectionAddress,
  projectAuth
);
```

**changeUserAuth**

_User Authority is Signer_

```typescript
const initializer = new PublicKey("your user account initializer");
const newAuth = new PublicKey("your new user account authority");
const collectionAddress = new PublicKey("your collection mint address");
const projectAuth = new PublicKey("your project authority");

//Changes the authority for a user account and returns a Transaction Signature or an Error
const changeUserAuth = await badges.changeUserAuth(
  initializer,
  newAuth,
  collectionAddress,
  projectAuth
);

//Gets the transaction for changing the user account authority
const changeUserAuthTx = await badges.getChangeUserAuthTx(
  initializer,
  newAuth,
  collectionAddress,
  projectAuth
);
```

## Data Fetching

### Project

**getProjectState**

```typescript
const collectionAddress = new PublicKey("your collection mint address");

//Gets the state of a project
const projectState = await badges.getProjectState(collectionAddress);
```

**getAllProjects**

```typescript
//Gets all projects
const allProjects = await badges.getAllProjects();
```

### Badges

**getBadgeState**

```typescript
const mint = new PublicKey("your badge mint address");
const project = new PublicKey("your project address"); //This is the project state address

//Gets the state of a badge
const badgeState = await badges.getBadgeState(mint, project);
```

**getBadgeMetadataUri**

```typescript
const mint = new PublicKey("your badge mint address");

//Gets the metadata uri for a badge
const metadataUri = await badges.getBadgeMetadataUri(mint);
```

**getBadgeImageUri**

```typescript
const mint = new PublicKey("your badge mint address");

//Gets the image uri for a badge
const imageUri = await badges.getBadgeImageUri(mint);
```

**getProjectBadges**

```typescript
const project = new PublicKey("your project address"); //This is the project state address

//Gets all badges for a project
const projectBadges = await badges.getProjectBadges(project);
```

### User Accounts

**getUserAccount**

```typescript
const initializer = new PublicKey("your user account initializer");
const collectionAddress = new PublicKey("your collection mint address");
const projectAuth = new PublicKey("your project authority");

//Gets the state of a user account
const userAccount = await badges.getUserAccount(
  initializer,
  collectionAddress,
  projectAuth
);
```

**getAllUserAccounts**

```typescript
//Gets all user accounts
const allUserAccounts = await badges.getAllUserAccounts();
```
