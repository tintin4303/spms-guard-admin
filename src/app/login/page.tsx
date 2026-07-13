import { LoginForm } from "@/app/login/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Stunning gradient mesh background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[100px] mix-blend-screen" />

      <div className="z-10 w-full max-w-sm px-4">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">SPMS G.U.A.R.D</h1>
          <p className="text-slate-400 text-sm font-medium">Security Patrol Management System</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
