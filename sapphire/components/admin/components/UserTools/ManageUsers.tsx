import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/helpers/utils";
import { AIGeneration, SapphireUser } from "@/types";
import { useClipboard } from "@mantine/hooks";
import axios from "axios";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LuArrowBigDown,
  LuCopy,
  LuDownload,
  LuPlus,
  LuPlusCircle,
  LuSearch,
  LuX,
  LuXCircle,
} from "react-icons/lu";
import useSWR, { KeyedMutator } from "swr";

type ManageUsersUser = {
  id: string;
  name: string;
  email: string;
  sapphires: number;
  wallets: string[];
  generations: number;
  purchases: number;
};
const ManageUsers = () => {
  const [searchBy, setSearchBy] = useState<
    "email" | "id" | "wallet" | "name" | "all"
  >("all");
  const [searchValue, setSearchValue] = useState<string>("");
  const clipboard = useClipboard({ timeout: 500 });
  const {
    data: fetchedUsers,
    isLoading,
    error,
    mutate,
  } = useSWR(`/api/data/get/user?searchBy=all&searchValue=`, fetcher);
  const [users, setUsers] = useState<ManageUsersUser[] | Error>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<ManageUsersUser | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isCreditsModal, setIsCreditsModal] = useState<boolean>(false);
  const limit = 20;
  const [page, setPage] = useState<number>(1);
  const [isGenerations, setIsGenerations] = useState<boolean>(false);
  const [selectedUsersGenerations, setSelectedUsersGenerations] = useState<
    AIGeneration[] | Error
  >([]);

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers.users);
    }
  }, [fetchedUsers]);

  async function searchUsers() {
    if (searchBy !== "all" && !searchValue.length) {
      return toast.error("Please enter a search value");
    }
    setIsSearching(true);
    try {
      const res = await axios.get(
        `/api/data/get/user?searchBy=${searchBy}&searchValue=${searchValue}`
      );
      const data = res.data;
      setUsers(data.users);
      setIsSearching(false);
    } catch (error) {
      console.error(error);
      setIsSearching(false);
      setUsers(new Error("An error occurred while fetching users"));
    }
    setIsSearching(false);
  }

  async function fetchGenerations(userId: string) {
    setIsGenerations(true);
    try {
      const res = await axios.get(`/api/data/get/generations?userId=${userId}`);
      const data = res.data;
      setSelectedUsersGenerations(data.generations);
    } catch (error) {
      console.error(error);
      setSelectedUsersGenerations(
        new Error("An error occurred while fetching generations")
      );
    }
  }
  return (
    <>
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="max-w-5xl grid grid-cols-1 max-h-screen gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Details</DialogTitle>
                <DialogDescription className=" capitalize">
                  <div className="flex flex-row gap-2 items-center">
                    <span className="font-bold">Id:</span> {selectedUser?.id}
                    <LuCopy
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => {
                        clipboard.copy(selectedUser?.id);
                      }}
                    />
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="font-bold">Name:</span>{" "}
                    {selectedUser?.name}
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="font-bold">Email:</span>{" "}
                    {selectedUser?.email}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="w-full aspect-square relative overflow-hidden rounded-lg">
            <p
              className="p-2 rounded-md hover:bg-white hover:text-black cursor-pointer flex flex-row gap-2 items-center"
              onClick={() => fetchGenerations(selectedUser?.id!)}
            >
              View Generations <LuArrowBigDown size={20} />
            </p>
            {!isGenerations ? null : selectedUsersGenerations instanceof
              Error ? (
              <p>{"Error Loading Generations"}</p>
            ) : !selectedUsersGenerations.length ? (
              <p>{"No Generations Found"}</p>
            ) : (
              <div className="grid grid-cols-5 items-center gap-2 cursor-pointer">
                {selectedUsersGenerations.map((generation) => (
                  <Image
                    alt={generation.id}
                    key={generation.id}
                    className="rounded-sm"
                    onClick={() => clipboard.copy(generation.id)}
                    src={generation.image}
                    height={200}
                    width={150}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <section className="w-full flex flex-col justify-start items-start gap-2">
        <p className="text-lg">Manage Users</p>
        <div className="w-full flex flex-row gap-2 justify-start items-center mb-4">
          <Select
            value={searchBy}
            onValueChange={(e) =>
              setSearchBy(e as "email" | "id" | "wallet" | "name" | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Search By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Search By</SelectLabel>
                <SelectItem value="email">e-mail</SelectItem>
                <SelectItem value="id">id</SelectItem>
                <SelectItem value="wallet">wallet</SelectItem>
                <SelectItem value="name">name</SelectItem>
                <SelectItem value="all">all</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Value"
            className="w-2/3"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchUsers();
              }
            }}
          />
          <LuSearch
            className="h-6 w-6 text-muted-foreground cursor-pointer"
            onClick={searchUsers}
          />
        </div>
        {isLoading || isSearching ? (
          <Skeleton className="w-full h-10" />
        ) : users instanceof Error || error ? (
          <p>{"Error Loading User(s)"}</p>
        ) : users.length ? (
          <table className="w-full table-fixed h-96 overflow-y-scroll">
            <thead className="mb-4">
              <tr>
                <th className="py-2">ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Sapphires</th>
                <th>Wallets</th>
                <th>Generations</th>
                <th>Purchases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-4">{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.sapphires}</td>
                  <td>{user.wallets.length}</td>
                  <td>{user.generations}</td>
                  <td>{user.purchases}</td>
                  <td className="flex flex-row gap-2 relative">
                    {selectedUser === user && isCreditsModal && (
                      <AddCreditsModal
                        user={selectedUser}
                        setIsCreditsModal={setIsCreditsModal}
                        mutate={mutate}
                      />
                    )}
                    <button
                      className="hover:bg-white p-2 rounded-md hover:text-black text-xs"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsCreditsModal(true);
                      }}
                    >
                      Manage Sapphires
                    </button>

                    <button
                      className="hover:bg-white p-2 rounded-md hover:text-black"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDialog(true);
                      }}
                    >
                      View
                    </button>
                    <button className="hover:bg-white p-2 rounded-md hover:text-black">
                      Delete (Not active)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div></div>
        )}
      </section>
    </>
  );
};

export default ManageUsers;

const AddCreditsModal = ({
  user,
  setIsCreditsModal,
  mutate,
}: {
  user: ManageUsersUser;
  setIsCreditsModal: Dispatch<SetStateAction<boolean>>;
  mutate: KeyedMutator<ManageUsersUser[]>;
}) => {
  const [credits, setCredits] = useState<number>(0);
  async function manageCredits(addOrRemove: "add" | "remove") {
    try {
      const res = await axios.post("/api/admin/users/manageCredits", {
        userId: user.id,
        credits: credits,
        addOrRemove: addOrRemove,
      });
      if (res.status === 200) {
        toast.success("Credits added successfully");
        setIsCreditsModal(false);
        await mutate();
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while adding credits");
    }
  }
  return (
    <div className="w-60 h-40 bg-secondary rounded-md p-4 absolute top-10 right-20 z-40 gap-2 flex flex-col justify-center items-center">
      <LuXCircle
        className="absolute top-1 right-1 cursor-pointer"
        size={20}
        onClick={() => setIsCreditsModal(false)}
      />
      <p className="text-xs">Add Credits to {user.name}</p>
      <p className="text-xs">Current Credits: {user.sapphires}</p>
      <Input
        type="number"
        value={credits}
        onChange={(e) => setCredits(parseInt(e.target.value))}
        placeholder="Amount"
        className="w-20"
      />
      <div className="flex flex-row gap-2">
        <button
          className="w-1/3 bg-primary-700 text-white p-2 rounded-md mt-4"
          onClick={() => manageCredits("add")}
        >
          Add
        </button>
        <button
          className="w-1/3 bg-primary-700 text-white p-2 rounded-md mt-4"
          onClick={() => manageCredits("remove")}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
