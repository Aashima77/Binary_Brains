import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;

  if (accessToken) {
    try {
      await verify(accessToken, process.env.JWT_ACCESS_SECRET!);
      return NextResponse.next();
    } catch {
      // eslint-disable-next-line no-console
      console.error("Access token expired, attempting to refresh...");
    }
  }
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const refreshResponse = await fetch(
      new URL("/api/refresh", req.url).toString(),
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      },
    );

    if (refreshResponse.ok) {
      const newAccessToken = await refreshResponse.json();
      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/",
      });
      return response;
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
