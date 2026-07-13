import { getUsers } from "@/app/dashboard/users/actions"
import { UserTable } from "@/components/users/user-table"
import { CreateUserModal } from "@/components/users/create-user-modal"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access for operation managers, clients, and agencies.</p>
        </div>
        <CreateUserModal />
      </div>

      <UserTable users={users} />
    </div>
  )
}
