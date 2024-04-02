import { fetcher } from "@/lib/helpers/utils";
import { PublicGeneration } from "@/types";
import { useSession } from "next-auth/react";
import useSWRImmutable from "swr/immutable";

export function useGenerations({
  limit,
  skip,
  generator,
  order,
  sortBy,
  isMintable,
}: {
  limit: number;
  skip: number;
  generator: string;
  order: string;
  sortBy: string;
  isMintable: boolean;
}) {
  const { data: session } = useSession();

  const url = !session
    ? null
    : `/api/generations?limit=${limit}&skip=${skip}&generator=${generator}&order=${order}&sortBy=${sortBy}&isMintable=${isMintable}`;
  const { data, isLoading, error, mutate } = useSWRImmutable<
    PublicGeneration[]
  >(url, fetcher);

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
