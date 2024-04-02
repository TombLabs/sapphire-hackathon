import { Idl } from "@coral-xyz/anchor";

export const idl = {
    "version": "0.1.0",
    "name": "badges",
    "instructions": [
        {
            "name": "initGlobalState",
            "accounts": [
                {
                    "name": "globalState",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "feeWallet",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "projectFee",
                    "type": "u64"
                },
                {
                    "name": "userFee",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "changeGlobalFeeWallet",
            "accounts": [
                {
                    "name": "globalState",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "newFeeWallet",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "changeGlobalFee",
            "accounts": [
                {
                    "name": "globalState",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "projectFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "userFee",
                    "type": {
                        "option": "u64"
                    }
                }
            ]
        },
        {
            "name": "createProject",
            "accounts": [
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "feeWallet",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK Will perform our own check"
                    ]
                },
                {
                    "name": "globalState",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "globalFeeWallet",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK Will perform our own check"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "fee",
                    "type": {
                        "option": "u64"
                    }
                }
            ]
        },
        {
            "name": "changeProjectFee",
            "accounts": [
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "fee",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "changeProjectFeeWallet",
            "accounts": [
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "newFeeWallet",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK will perform our own check"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "changeProjectName",
            "accounts": [
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": false,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                }
            ]
        },
        {
            "name": "deleteProject",
            "accounts": [
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "createBadge",
            "accounts": [
                {
                    "name": "badge",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "metadata",
                    "type": "string"
                },
                {
                    "name": "image",
                    "type": "string"
                },
                {
                    "name": "royalty",
                    "type": "u16"
                }
            ]
        },
        {
            "name": "deleteBadge",
            "accounts": [
                {
                    "name": "badge",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": []
        },
        {
            "name": "createUserAccount",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userAuth",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "initializer",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "dbId",
                    "type": {
                        "option": "string"
                    }
                }
            ]
        },
        {
            "name": "changeUserAuth",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "initializer",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "currentUserAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "newUserAuth",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "deleteUserAccount",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "initializer",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "userAuth",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": []
        },
        {
            "name": "addBadgeToUser",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "initializer",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "userAuth",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "badge",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrow",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "withdrawBadge",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "initializer",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "userAuth",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "badge",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "project",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrow",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionAddress",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "projectAuth",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "CHECK this is safe because we are not reading or writing to this account"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "badgeIndex",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "GlobalState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "feeWallet",
                        "type": "publicKey"
                    },
                    {
                        "name": "projectFee",
                        "type": "u64"
                    },
                    {
                        "name": "userFee",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "Badge",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "metadata",
                        "type": "string"
                    },
                    {
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "project",
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "Project",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "projectAuth",
                        "type": "publicKey"
                    },
                    {
                        "name": "collectionAddress",
                        "type": "publicKey"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "feeWallet",
                        "type": "publicKey"
                    },
                    {
                        "name": "fee",
                        "type": "u64"
                    },
                    {
                        "name": "badges",
                        "type": {
                            "vec": "publicKey"
                        }
                    }
                ]
            }
        },
        {
            "name": "UserAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "userAuth",
                        "type": "publicKey"
                    },
                    {
                        "name": "badges",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "bumps",
                        "type": "bytes"
                    },
                    {
                        "name": "escrows",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "dbId",
                        "type": {
                            "option": "string"
                        }
                    },
                    {
                        "name": "initializer",
                        "type": "publicKey"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "AuthorityMismatch",
            "msg": "Authority does not match expected authority"
        },
        {
            "code": 6001,
            "name": "InsufficientFunds",
            "msg": "Insufficient Funds"
        },
        {
            "code": 6002,
            "name": "InvalidFeeWallet",
            "msg": "Incorrect Fee Wallet"
        },
        {
            "code": 6003,
            "name": "InvalidMint",
            "msg": "Invalid token mint address"
        },
        {
            "code": 6004,
            "name": "InvalidOwner",
            "msg": "Invalid account owner, this wallet cannot be used as a fee wallet"
        },
        {
            "code": 6005,
            "name": "BadgesExist",
            "msg": "All badges must be cleared before deleting a project"
        },
        {
            "code": 6006,
            "name": "BadgeDoesNotExist",
            "msg": "Badge does not exist"
        },
        {
            "code": 6007,
            "name": "IncorrectFeeAddress",
            "msg": "Incorrect fee address provided"
        },
        {
            "code": 6008,
            "name": "CollectionMismatch",
            "msg": "Incorrect collection address provided"
        },
        {
            "code": 6009,
            "name": "UnexpectedPublicKey",
            "msg": "Incorrect publickey provided"
        }
    ],
    "metadata": {
        "address": "BADGEDniMk3LxR5JgHjyFKnSQhNYiXr5etsuzTFCTd1S"
    }
} as Idl