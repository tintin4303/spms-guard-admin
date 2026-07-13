import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')

  if (isOnLoginPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
