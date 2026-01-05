import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/" || isAuthPage
  const isApiRoute = pathname.startsWith("/api")

  // Allow all API routes (including auth)
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Allow public pages
  if (isPublicPage) {
    // Redirect logged in users away from auth pages to dashboard
    if (isLoggedIn && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes - redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)"],
}
