import { auth } from "@/auth"
import { logOut } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-400 mb-8">
          Welcome back, <span className="text-white font-medium">{session?.user?.email}</span>!
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-black/40 rounded-lg border border-white/5">
            <p className="text-sm text-zinc-500">Role</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className="font-mono">{((session?.user as any)?.role) || "N/A"}</p>
          </div>
          
          <form action={logOut}>
            <Button type="submit" variant="destructive" className="w-full mt-6">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}