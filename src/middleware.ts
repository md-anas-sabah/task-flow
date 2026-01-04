import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/" || isAuthPage
  const isApiAuth = pathname.startsWith("/api/auth")

  // Allow API auth routes
  if (isApiAuth) {
    return NextResponse.next()
  }

  // Redirect logged in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect non-logged in users to login page
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/register|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
