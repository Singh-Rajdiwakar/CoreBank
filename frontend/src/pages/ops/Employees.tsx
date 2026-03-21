import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { listBranches } from '../../api/admin'
import { createEmployee, listEmployees, updateEmployeeStatus } from '../../api/employees'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

export default function EmployeeManagementPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    employeeCode: '',
    manager: false,
  })

  const branchesQ = useQuery({
    queryKey: ['branches'],
    queryFn: () => listBranches({ status: 'ACTIVE', size: 1000 }),
  })

  const employeesQ = useQuery({
    queryKey: ['employees', selectedBranch],
    queryFn: () => listEmployees(parseInt(selectedBranch), { page: 0, size: 100 }),
    enabled: !!selectedBranch,
  })

  const createMut = useMutation({
    mutationFn: () =>
      createEmployee({
        userId: parseInt(formData.userId),
        branchId: parseInt(selectedBranch),
        employeeCode: formData.employeeCode,
        manager: formData.manager,
      }),
    onSuccess: () => {
      toast.success('Employee created successfully')
      employeesQ.refetch()
      setFormData({ userId: '', employeeCode: '', manager: false })
      setShowForm(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    },
  })

  const statusMut = useMutation({
    mutationFn: ({ employeeId, status }: { employeeId: number; status: string }) =>
      updateEmployeeStatus(employeeId, status as any),
    onSuccess: () => {
      toast.success('Status updated')
      employeesQ.refetch()
    },
  })

  const branches = branchesQ.data?.content ?? []
  const employees = employeesQ.data?.content ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Operations</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Employee Management</h1>
          <p className="mt-1 text-sm text-muted">Manage branch employees and roles</p>
        </div>
        {selectedBranch && (
          <Button onClick={() => setShowForm(!showForm)} variant="primary">
            {showForm ? 'Cancel' : '+ Add Employee'}
          </Button>
        )}
      </header>

      <div className="surface p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-2">Select Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="input w-full max-w-md"
          >
            <option value="">Choose a branch...</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} • {b.branchCode}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Create New Employee</h3>
            <div className="grid gap-3 max-w-md">
              <Input
                type="number"
                placeholder="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
              <Input
                placeholder="Employee Code (e.g., EMP001)"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Manager Role</span>
              </label>
              <Button
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending || !formData.userId || !formData.employeeCode}
                className="gap-2"
                variant="primary"
              >
                {createMut.isPending && <Spinner className="h-4 w-4" />}
                Create
              </Button>
            </div>
          </div>
        )}
      </div>

      {employeesQ.isLoading ? (
        <div className="surface p-6 flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading employees...
        </div>
      ) : employees.length ? (
        <div className="surface p-6 space-y-3">
          <h2 className="font-semibold">Employees ({employees.length})</h2>
          <div className="grid gap-3">
            {employees.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-black/5">
                <div className="flex-1">
                  <p className="font-semibold">{e.username}</p>
                  <p className="text-xs text-muted mt-1">
                    Code: {e.employeeCode} {e.manager && '• Manager'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      e.status === 'ACTIVE'
                        ? 'success'
                        : e.status === 'SUSPENDED'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {e.status}
                  </Badge>
                  {e.status !== 'SUSPENDED' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        statusMut.mutate({
                          employeeId: e.id,
                          status: 'SUSPENDED',
                        })
                      }
                      disabled={statusMut.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                  {e.status === 'SUSPENDED' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        statusMut.mutate({
                          employeeId: e.id,
                          status: 'ACTIVE',
                        })
                      }
                      disabled={statusMut.isPending}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedBranch ? (
        <div className="surface p-6 text-center text-sm text-muted">No employees found</div>
      ) : null}
    </div>
  )
}
