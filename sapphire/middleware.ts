import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  // get session token
  const token = await getToken({ req });

  // if no token
  if (!token) {

    if (pathname == "/") return;
    // redirect if not at home page
    if (pathname == "/policy/privacy-policy") return NextResponse.next();
    return NextResponse.redirect(new URL("/", req.url));
  }

  // check for callback url
  const callbackUrl = searchParams.get("callbackUrl");

  // if have callback url
  if (!!callbackUrl) {
    // create callback url
    const url = new URL(callbackUrl, req.url);

    // append error message to url if available
    const error = searchParams.get("error") as string;
    if (!!error) {
      url.searchParams.append("error", error);
    }

    // redirect to callback url
    return NextResponse.redirect(new URL(url, req.url));
  }

  // if at home page
  if (pathname == "/") {
    // redirect to explore page
    return NextResponse.redirect(new URL("/explore", req.url));
  }

  // do nothing
  return NextResponse.next();
}

export const config = { matcher: "/((?!.*\\.|api\\/|_next/static|_next/image).*)" };
