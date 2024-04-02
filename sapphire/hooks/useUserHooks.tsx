import { fetcher } from "@/lib/helpers/utils";
import { Account, SapphireUser } from "@/types";
import { useSession } from "next-auth/react";
import useSWRImmutable from "swr/immutable";

export function useUser() {
  const { data: session } = useSession();
  const { data, isLoading, error, mutate } = useSWRImmutable<SapphireUser>(
    session ? `/api/user` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserAccounts() {
  const { data: session } = useSession();
  const { data, isLoading, error, mutate } = useSWRImmutable<Account[]>(
    session ? `/api/accounts` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
export function useUserWallets() {
  const { data: session } = useSession();
  const { data, isLoading, error, mutate } = useSWRImmutable<string[]>(
    session ? `/api/user/wallet` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
