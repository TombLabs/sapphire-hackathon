import { NavBar } from "../nav-bar";

export const LayoutMain = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="grow xl:ml-64 flex flex-col">{children}</main>
    </div>
  );
};
