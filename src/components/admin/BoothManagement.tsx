'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Pencil,
  Trash2,
  Filter,
  Loader2,
  Box,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Booth {
  id: string
  label: string
  area: number
  status: string
  x: number
  y: number
  width: number
  height: number
}

interface EditFormData {
  label: string
  area: number
  status: string
  boothType: string
  price: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'admin.boothMap.legend.available', color: 'bg-green-100 text-green-700 border-green-200' },
  pending: { label: 'admin.pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  booked: { label: 'admin.approved', color: 'bg-blue-100 text-blue-700 border-blue-200' },
}

export default function BoothManagement() {
  const { t, isRTL } = useTranslation()
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    label: '',
    area: 0,
    status: 'available',
    boothType: 'standard',
    price: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchBooths = useCallback(async () => {
    try {
      const res = await fetch('/api/booths')
      const data = await res.json()
      if (data.success) {
        setBooths(data.data)
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchBooths()
  }, [fetchBooths])

  const filteredBooths = booths.filter((booth) => {
    const matchesSearch =
      !searchQuery ||
      booth.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booth.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (booth: Booth) => {
    setEditingBooth(booth)
    setEditForm({
      label: booth.label,
      area: booth.area,
      status: booth.status,
      boothType: 'standard',
      price: Math.round(booth.area * 1700),
    })
    setEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingBooth) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/booths/${editingBooth.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        setEditDialogOpen(false)
        fetchBooths()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/booths/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        setDeleteId(null)
        fetchBooths()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/booths/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        fetchBooths()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  const statusCounts = {
    all: booths.length,
    available: booths.filter((b) => b.status === 'available').length,
    pending: booths.filter((b) => b.status === 'pending').length,
    booked: booths.filter((b) => b.status === 'booked').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Box className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? 'إدارة الأجنحة' : 'Booth Management'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL ? 'عرض وتعديل أجنحة المعرض' : 'View and manage exhibition booths'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Box className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{isRTL ? 'الإجمالي' : 'Total'}</p>
              <p className="text-lg font-bold">{statusCounts.all}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600">{isRTL ? 'متاح' : 'Available'}</p>
              <p className="text-lg font-bold text-green-700">{statusCounts.available}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-yellow-600">{isRTL ? 'قيد الحجز' : 'Pending'}</p>
              <p className="text-lg font-bold text-yellow-700">{statusCounts.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <XCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600">{isRTL ? 'محجوز' : 'Booked'}</p>
              <p className="text-lg font-bold text-blue-700">{statusCounts.booked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'البحث بالتسمية...' : 'Search by label...'}
              className="ps-9"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isRTL ? 'جميع الحالات' : 'All Status'}
                </SelectItem>
                <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                <SelectItem value="pending">{isRTL ? 'قيد الحجز' : 'Pending'}</SelectItem>
                <SelectItem value="booked">{isRTL ? 'محجوز' : 'Booked'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-gray-500">
            {filteredBooths.length} {isRTL ? 'جناح' : 'booths'}
          </span>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredBooths.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {t('common.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.editor.label')}</TableHead>
                    <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{t('admin.editor.area')} (m²)</TableHead>
                    <TableHead>{t('admin.editor.price')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{isRTL ? 'الموضع' : 'Position'}</TableHead>
                    <TableHead className="text-end">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooths.map((booth) => {
                    const statusCfg = STATUS_CONFIG[booth.status] || STATUS_CONFIG.available
                    return (
                      <TableRow key={booth.id}>
                        <TableCell className="font-semibold">{booth.label}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            standard
                          </Badge>
                        </TableCell>
                        <TableCell>{booth.area} m²</TableCell>
                        <TableCell className="font-semibold">
                          {Math.round(booth.area * 1700).toLocaleString()} {t('common.sar')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusCfg.color}>
                            {t(statusCfg.label)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-500" dir="ltr">
                            ({Math.round(booth.x)}, {Math.round(booth.y)})
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(booth)}
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {booth.status === 'available' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:bg-yellow-50"
                                onClick={() => handleStatusChange(booth.id, 'booked')}
                                title={isRTL ? 'تغيير الحالة' : 'Change Status'}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            ) : booth.status === 'booked' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleStatusChange(booth.id, 'available')}
                                title={isRTL ? 'تغيير الحالة' : 'Change Status'}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : null}

                            <AlertDialog open={deleteId === booth.id} onOpenChange={() => setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  title={isRTL ? 'حذف' : 'Delete'}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {isRTL ? 'حذف الجناح' : 'Delete Booth'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {isRTL
                                      ? `هل أنت متأكد من حذف الجناح "${booth.label}"؟`
                                      : `Are you sure you want to delete booth "${booth.label}"? This action cannot be undone.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(booth.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('admin.booths.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? `تعديل الجناح: ${editingBooth?.label}` : `Edit Booth: ${editingBooth?.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">{t('admin.editor.label')}</Label>
              <Input
                value={editForm.label}
                onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t('admin.editor.area')} (m²)</Label>
              <Input
                type="number"
                value={editForm.area}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    area: parseFloat(e.target.value) || 0,
                    price: Math.round((parseFloat(e.target.value) || 0) * 1700),
                  }))
                }
                dir="ltr"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t('admin.status')}</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                  <SelectItem value="pending">{isRTL ? 'قيد الحجز' : 'Pending'}</SelectItem>
                  <SelectItem value="booked">{isRTL ? 'محجوز' : 'Booked'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t('admin.editor.type')}</Label>
              <Select
                value={editForm.boothType}
                onValueChange={(v) => setEditForm((f) => ({ ...f, boothType: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('admin.editor.standard')}</SelectItem>
                  <SelectItem value="vip">{t('admin.editor.vip')}</SelectItem>
                  <SelectItem value="sponsor">{t('admin.editor.sponsor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t('admin.editor.price')} ({t('common.sar')})</Label>
              <Input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                }
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleEditSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
