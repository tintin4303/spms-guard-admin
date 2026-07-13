"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Assuming type matches the Prisma select result
type User = {
  id: string
  email: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: Date
}

export function UserTable({ users }: { users: User[] }) {
  return (
    <div className="rounded-md border border-slate-200 shadow-sm bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-700">User Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Role</TableHead>
            <TableHead className="font-semibold text-slate-700">Status</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Date Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-900">{user.email || "No Email"}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      Suspended
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-slate-500 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "ADMIN":
      return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
    case "MANAGER":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Operation Manager</Badge>
    case "CLIENT":
      return <Badge variant="outline" className="text-slate-600 border-slate-300">Client</Badge>
    case "AGENCY":
      return <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">Agency</Badge>
    default:
      return <Badge variant="secondary">{role}</Badge>
  }
}
