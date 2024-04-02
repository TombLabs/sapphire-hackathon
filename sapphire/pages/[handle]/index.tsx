import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { FaDiscord, FaTwitter } from "react-icons/fa6";
import useSWRImmutable from "swr/immutable";

export default function ProfilePage() {
  const router = useRouter();
  const { handle } = router.query;

  // add types from prisma, useSWRImmutable<AddTypeHere>
  const { data: user, isLoading, error } = useSWRImmutable(`/api/user/${handle}`);

  // api
  // route /api/user/[handle]
  // get handle from req.query.handle
  // prisma find unique by handle
  // include accounts but only select provider and providerAccountId
  // e.g. include: { accounts: { select: { provider: true, providerAccountId: true}}} - might have typos
  // return response.json({user})

  return (
    <>
      {!!handle && <NextSeo title={handle as string} />}
      {error ? (
        <div className="min-h-screen p-4 text-center flex items-center justify-center">
          Something went wrong.
        </div>
      ) : !user && !isLoading ? (
        <div className="min-h-screen p-4 text-center flex items-center justify-center">
          User does not exist.
        </div>
      ) : (
        <div className="sm:p-6 min-h-screen flex items-center justify-center sm:py-16 bg-black relative border-b overflow-hidden">
          {!!user?.banner && (
            <Image
              src={user.banner}
              alt="banner-fullscreen"
              fill
              className="h-full w-full absolute sm:block hidden inset-0 object-cover opacity-30 blur-xl scale-110"
            />
          )}
          <div className="relative max-w-3xl mx-auto w-full bg-background rounded-md overflow-hidden sm:border">
            {true ? (
              <>
                <Skeleton className="aspect-[3/1] rounded-none" />

                <div className="px-4">
                  <div className="relative aspect-square bg-background overflow-hidden rounded-full sm:mx-auto sm:-my-16 -mt-8 sm:w-32 w-16 border-4 border-background">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>

                <div className="sm:p-6 p-4 flex flex-col gap-6">
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className=" aspect-[3/1] relative bg-muted-foreground">
                  {!!user.banner && (
                    <Image
                      src={user.banner}
                      alt="banner"
                      fill
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="px-4">
                  <div className="relative aspect-square sm:mx-auto sm:w-32 w-16 rounded-full bg-muted-foreground sm:-my-16 -mt-8 border-4 border-background overflow-hidden">
                    <Image
                      fill
                      alt="avatar"
                      src={user.image}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className=" p-4 sm:p-6 flex flex-col gap-4">
                  <div className="flex sm:flex-row flex-col gap-4 justify-between items-start ">
                    <div className="flex-1 sm:pr-16">
                      <p className="font-medium text-lg">{user.name}</p>
                      <p className="text-muted-foreground">@{user.handle}</p>
                    </div>

                    <div className="flex flex-1 gap-2 items-center justify-end sm:pl-16">
                      <FaTwitter className="sm:h-5 w-4 sm:w-5 h-4 text-muted-foreground" />
                      <FaDiscord className="sm:h-5 w-4 sm:w-5 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  {!!user.bio && <p className="text-muted-foreground">{user.bio} </p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
