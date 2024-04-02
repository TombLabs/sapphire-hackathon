import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUserHooks";
import { tryCatchErrorHandler } from "@/lib/helpers/utils";
import { usernameSchema } from "@/lib/zod-schemas/user";
import { MIME_TYPES } from "@mantine/dropzone";
import { useForm, zodResolver } from "@mantine/form";
import axios from "axios";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuChevronLeft, LuServerOff, LuUpload, LuX } from "react-icons/lu";
import { z } from "zod";

export default function GeneralPage() {
  const { data: user, isError } = useUser();

  return (
    <>
      <NextSeo title="General Settings" />
      <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full py-16">
        <Link
          href={"/settings"}
          className="flex items-center gap-1 hover:gap-2 transition-all mr-auto"
        >
          <LuChevronLeft className="w-4 h-4" /> Account Settings
        </Link>
        <Separator />

        <div>
          <h2>General</h2>
          <p className="text-muted-foreground">
            Edit your profile information.
          </p>
        </div>
        {isError ? (
          <Card>
            <CardHeader className="py-24">
              <div className="flex flex-col text-center items-center justify-center gap-2">
                <LuServerOff className="h-6 w-6" />
                <p>Something went wrong</p>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            {!user ? (
              <>
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </>
            ) : (
              <>
                <CardAvatar />
                {/* <CardBanner /> */}
                {/* <CardHandle /> */}
                <CardUsername />
                {/* <CardBio /> */}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const CardAvatar = () => {
  const { data: user, mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleOnUpload = useCallback(() => {
    if (!!avatarRef.current) {
      avatarRef.current.click();
    }
  }, [avatarRef]);

  const handleAvatarOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      setFile(e.target.files[0]);
    },
    []
  );

  const handleOnSave = useCallback(async () => {
    if (!user) {
      toast.error("Could not get user");
      return;
    }
    if (!file) {
      toast.error("Plaese upload an image");
      return;
    }
    setIsLoading(true);
    try {
      const uploadImageWithBlob = (await import("@/lib/helpers/web3-helpers"))
        .uploadImageWithBlob;
      const url = await uploadImageWithBlob(file);
      await axios.patch("/api/user", { avatar: url });
      await mutate();
      setFile(null);
      toast.success("Updated");
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsLoading(false);
  }, [user, file]);

  if (!user) return <Skeleton className="h-80" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>
          Upload a custom avatar for your profile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 items-end max-w-[240px]">
            <div className="w-3/6 border rounded-full aspect-square bg-background relative overflow-hidden">
              <Image
                src={!!file ? URL.createObjectURL(file) : user.image}
                alt="avatar"
                fill
              />
            </div>
            <div className="w-2/6 border rounded-full aspect-square bg-background relative overflow-hidden">
              <Image
                src={!!file ? URL.createObjectURL(file) : user.image}
                alt="avatar"
                fill
              />
            </div>
            <div className="w-1/6 border rounded-full aspect-square bg-background relative overflow-hidden">
              <Image
                src={!!file ? URL.createObjectURL(file) : user.image}
                alt="avatar"
                fill
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              ref={avatarRef}
              type="file"
              multiple={false}
              accept={`${MIME_TYPES.png}, ${MIME_TYPES.jpeg}, ${MIME_TYPES.webp}`}
              onChange={handleAvatarOnChange}
              className="hidden"
            />
            <Button
              disabled={isLoading}
              variant={"secondary"}
              onClick={handleOnUpload}
            >
              <LuUpload /> Upload
            </Button>
            {!!file && (
              <Button
                disabled={isLoading}
                variant={"outline"}
                size={"icon"}
                onClick={() => setFile(null)}
              >
                <LuX />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-3 gap-4">
        <Button
          isLoading={isLoading}
          disabled={isLoading || !file}
          onClick={handleOnSave}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

type FormUsername = z.infer<typeof usernameSchema>;
const CardUsername = () => {
  const { data: user, mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormUsername>({
    initialValues: { name: "" },
    validateInputOnChange: true,
    validate: zodResolver(usernameSchema),
  });

  useEffect(() => {
    if (!user) return;
    const newValues: FormUsername = {
      name: user.name,
    };
    form.setValues(newValues);
    form.resetDirty(newValues);
  }, [user?.name]);

  const handleOnSave = useCallback(
    async (form: FormUsername) => {
      if (!user) {
        toast.error("Could not get user");
        return;
      }
      setIsLoading(true);
      try {
        await axios.patch("/api/user", { name: form.name.trim() });
        await mutate();
        toast.success("Updated");
      } catch (err) {
        tryCatchErrorHandler(err);
      }
      setIsLoading(false);
    },
    [user]
  );

  if (!user) return;
  return (
    <form onSubmit={form.onSubmit(handleOnSave)}>
      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>
            Enter a username that you would like to use.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-1 max-w-xs">
            <Input
              aria-label="username"
              disabled={isLoading}
              className={`${!!form.errors.name ? "border-destructive" : ""}`}
              {...form.getInputProps("name")}
            />
            {!!form.errors.name && (
              <Label className="text-sm text-destructive">
                {form.errors.name}
              </Label>
            )}
          </div>
        </CardContent>
        <CardFooter className="py-3">
          <Button
            isLoading={isLoading}
            disabled={!user || isLoading || !form.isDirty() || !form.isValid()}
            type="submit"
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

// const CardBanner = () => {
//   const { data: user, mutate } = useUser();
//   const [isLoading, setIsLoading] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const bannerRef = useRef<HTMLInputElement>(null);

//   const handleOnUpload = useCallback(() => {
//     if (!!bannerRef.current) {
//       bannerRef.current.click();
//     }
//   }, [bannerRef]);

//   const handleAvatarOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;
//     setFile(e.target.files[0]);
//   }, []);

//   const handleOnSave = useCallback(async () => {
//     if (!user) {
//       toast.error("Could not get user");
//       return;
//     }
//     if (!file) {
//       toast.error("Plaese upload an image");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const uploadImageWithBlob = (await import("@/lib/helpers/web3-helpers")).uploadImageWithBlob;
//       const url = await uploadImageWithBlob(file);
//       await axios.patch("/api/user", { banner: url });
//       await mutate();
//       setFile(null);
//       toast.success("Updated");
//     } catch (err) {
//       tryCatchErrorHandler(err);
//     }
//     setIsLoading(false);
//   }, [user, file]);

//   if (!user) return <Skeleton className="h-80" />;
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Banner</CardTitle>
//         <CardDescription>Showcase a banner when a user visits your profile.</CardDescription>
//       </CardHeader>

//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex gap-2 bg-muted items-center justify-center max-w-[400px] aspect-[3/1] relative rounded-md overflow-hidden">
//             {!!file || !!user.banner ? (
//               <Image src={!!file ? URL.createObjectURL(file) : user.banner} alt="banner" fill />
//             ) : (
//               <div className="text-center">
//                 <p>Upload a banner</p>
//                 <p className="text-muted-foreground text-xs">
//                   Recommended size 1500 x 500 px (3:1)
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <input
//               ref={bannerRef}
//               type="file"
//               multiple={false}
//               accept={`${MIME_TYPES.png}, ${MIME_TYPES.jpeg}, ${MIME_TYPES.webp}`}
//               onChange={handleAvatarOnChange}
//               className="hidden"
//             />
//             <Button disabled={isLoading} variant={"secondary"} onClick={handleOnUpload}>
//               <LuUpload /> Upload
//             </Button>
//             {!!file && (
//               <Button
//                 disabled={isLoading}
//                 variant={"outline"}
//                 size={"icon"}
//                 onClick={() => setFile(null)}
//               >
//                 <LuX />
//               </Button>
//             )}
//           </div>
//         </div>
//       </CardContent>
//       <CardFooter className="py-3 gap-4">
//         <Button isLoading={isLoading} disabled={isLoading || !file} onClick={handleOnSave}>
//           Save
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// type FormBio = z.infer<typeof bioSchema>;
// const CardBio = () => {
//   const { data: user, mutate } = useUser();
//   const [isLoading, setIsLoading] = useState(false);

//   const form = useForm<FormBio>({
//     initialValues: { bio: "" },
//     validateInputOnChange: true,
//     validate: zodResolver(bioSchema),
//   });

//   useEffect(() => {
//     if (!user) return;
//     const newValues: FormBio = {
//       bio: user.bio,
//     };
//     form.setValues(newValues);
//     form.resetDirty(newValues);
//   }, [user?.bio]);

//   const handleOnSave = useCallback(
//     async (form: FormBio) => {
//       if (!user) {
//         toast.error("Could not get user");
//         return;
//       }
//       setIsLoading(true);
//       try {
//         await axios.patch("/api/user", { name: form.bio.trim() });
//         await mutate();
//         toast.success("Updated");
//       } catch (err) {
//         tryCatchErrorHandler(err);
//       }
//       setIsLoading(false);
//     },
//     [user]
//   );

//   if (!user) return;
//   return (
//     <form onSubmit={form.onSubmit(handleOnSave)}>
//       <Card>
//         <CardHeader>
//           <CardTitle>Bio</CardTitle>
//           <CardDescription>Write something about yourself.</CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="grid gap-1 max-w-xs">
//             <Textarea
//               aria-label="bio"
//               disabled={isLoading}
//               className={`${!!form.errors.name ? "border-destructive" : ""}`}
//               {...form.getInputProps("bio")}
//             />
//             {!!form.errors.name && (
//               <Label className="text-sm text-destructive">{form.errors.bio}</Label>
//             )}
//           </div>
//         </CardContent>
//         <CardFooter className="py-3">
//           <Button
//             isLoading={isLoading}
//             disabled={!user || isLoading || !form.isDirty() || !form.isValid()}
//             type="submit"
//           >
//             Save
//           </Button>
//         </CardFooter>
//       </Card>
//     </form>
//   );
// };

// type FormHandle = z.infer<typeof handleSchema>;
// const CardHandle = () => {
//   const { data: user, mutate } = useUser();
//   const [isLoading, setIsLoading] = useState(false);

//   const form = useForm<FormHandle>({
//     initialValues: { handle: "213 123" },
//     validateInputOnChange: true,
//     validate: zodResolver(handleSchema),
//   });

//   useEffect(() => {
//     if (!user) return;
//     const newValues: FormHandle = {
//       handle: user.handle,
//     };
//     form.setValues(newValues);
//     form.resetDirty(newValues);
//   }, [user?.handle]);

//   const handleOnSave = useCallback(
//     async (form: FormHandle) => {
//       if (!user) {
//         toast.error("Could not get user");
//         return;
//       }
//       setIsLoading(true);
//       try {
//         await axios.patch("/api/user", { handle: form.handle.trim() });
//         await mutate();
//         toast.success("Updated");
//       } catch (err) {
//         tryCatchErrorHandler(err);
//       }
//       setIsLoading(false);
//     },
//     [user]
//   );

//   if (!user) return;
//   return (
//     <form onSubmit={form.onSubmit(handleOnSave)}>
//       <Card>
//         <CardHeader>
//           <CardTitle>Handle</CardTitle>
//           <CardDescription>
//             Handles are used to find your profile and also easily help others find you easily.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="grid gap-1 max-w-xs">
//             <div className="flex items-center gap-2">
//               <p className="text-muted-foreground">@</p>
//               <Input
//                 pattern="^[a-zA-Z0-9]*$"
//                 aria-label="username"
//                 disabled={isLoading}
//                 className={`${!!form.errors.name ? "border-destructive" : ""}`}
//                 {...form.getInputProps("handle")}
//                 onChange={(e) => {
//                   console.log(e.target.value);
//                   form.setFieldValue("handle", e.target.value.replace(/\s/g, ""));
//                 }}
//               />
//             </div>
//             {!!form.errors.name && (
//               <Label className="text-sm text-destructive">{form.errors.name}</Label>
//             )}
//           </div>
//         </CardContent>
//         <CardFooter className="py-3">
//           <Button
//             isLoading={isLoading}
//             disabled={!user || isLoading || !form.isDirty() || !form.isValid()}
//             type="submit"
//           >
//             Save
//           </Button>
//         </CardFooter>
//       </Card>
//     </form>
//   );
// };
