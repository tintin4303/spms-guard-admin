import { auth } from "@/auth"
import { canManageUsers } from "@/lib/permissions"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isOnUsersPage = req.nextUrl.pathname.startsWith('/dashboard/users')

  if (isOnLoginPage) {
    if (isLoggedIn) {
      const role = String((req.auth?.user as any)?.role || '').toLowerCase();
      if (role.includes('admin')) {
        return Response.redirect(new URL('/dashboard/users', req.nextUrl))
      }
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  // RBAC Enforcement
  if (isOnUsersPage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!canManageUsers((req.auth?.user as any)?.role)) {
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
