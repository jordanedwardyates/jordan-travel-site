import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdvisor } from "./lib/auth/advisor";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function middleware(request: NextRequest) {
  // Fail closed if the advisor secret has not been configured.
  if (!process.env.INTERNAL_PREVIEW_TOKEN || process.env.INTERNAL_PREVIEW_TOKEN.length < 32) {
    return new NextResponse("Not found", { status: 404, headers: privateHeaders });
  }

  if (!(await isAuthorizedAdvisor(request.headers.get("authorization")))) {
    return new NextResponse("Advisor authentication required", {
      status: 401,
      headers: {
        ...privateHeaders,
        "WWW-Authenticate": 'Basic realm="Advisor Sales Desk", charset="UTF-8"',
      },
    });
  }

  const response = NextResponse.next();
  for (const [name, value] of Object.entries(privateHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: ["/internal/sales", "/internal/sales/:path*"],
};
