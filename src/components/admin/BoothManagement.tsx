'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  available: { label: 'admin.boothMap.legend.available', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', icon: CheckCircle },
  pending: { label: 'admin.pending', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', icon: Clock },
  booked: { label: 'admin.approved', color: 'bg-blue-600/10 text-blue-700 dark:text-blue-500 border-blue-600/20', icon: Box },
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
    setIsLoading(true)
    try {
      const res = await fetch('/api/booths')
      const data = await res.json()
      if (data.success) {
        setBooths(Array.isArray(data.data) ? data.data : [])
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

  const filteredBooths = (booths || []).filter((booth) => {
    if (!booth) return false;
    const matchesSearch =
      !searchQuery ||
      booth?.label?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booth?.status === statusFilter
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
    
    // Save previous state for rollback
    const prevBooths = [...booths];
    
    // Optimistic Update
    const updatedBooth = { ...editingBooth, ...editForm };
    setBooths(prev => prev.map(b => b.id === editingBooth.id ? updatedBooth : b));
    setEditDialogOpen(false);

    try {
      const res = await fetch(`/api/booths/${editingBooth.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        // No need to fetchBooths, we already updated locally
      } else {
        // Rollback
        setBooths(prevBooths);
        toast.error(data.error || t('common.error'))
      }
    } catch {
      // Rollback
      setBooths(prevBooths);
      toast.error(t('common.error'))
    }
  }

  const handleDelete = async (id: string) => {
    const prevBooths = [...booths];
    
    // Optimistic Update
    setBooths(prev => prev.filter(b => b.id !== id));
    setDeleteId(null);

    try {
      const res = await fetch(`/api/booths/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
      } else {
        // Rollback
        setBooths(prevBooths);
        toast.error(data.error || t('common.error'))
      }
    } catch {
      // Rollback
      setBooths(prevBooths);
      toast.error(t('common.error'))
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const prevBooths = [...booths];
    
    // Optimistic Update
    setBooths(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));

    try {
      const res = await fetch(`/api/booths/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
      } else {
        // Rollback
        setBooths(prevBooths);
        toast.error(data.error || t('common.error'))
      }
    } catch {
      // Rollback
      setBooths(prevBooths);
      toast.error(t('common.error'))
    }
  }

  const statusCounts = {
    all: booths?.length || 0,
    available: (booths || []).filter((b) => b?.status === 'available').length,
    pending: (booths || []).filter((b) => b?.status === 'pending').length,
    booked: (booths || []).filter((b) => b?.status === 'booked').length,
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isRTL ? 'إدارة الأجنحة' : 'Booth Management'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'تحكم كامل في أجنحة المعرض وبياناتها' : 'Full control over exhibition booths and data'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: isRTL ? 'الإجمالي' : 'Total', count: statusCounts.all, icon: Box, color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
          { label: isRTL ? 'متاح' : 'Available', count: statusCounts.available, icon: CheckCircle, color: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
          { label: isRTL ? 'قيد الحجز' : 'Pending', count: statusCounts.pending, icon: Clock, color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
          { label: isRTL ? 'محجوز' : 'Booked', count: statusCounts.booked, icon: Box, color: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-500' }
        ].map((stat, i) => (
          <div key={i} className="relative group overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className={cn("absolute left-0 top-0 h-1 w-full opacity-70", stat.color)} />
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("h-5 w-5", stat.text)} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight", stat.text)}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Enhanced Filters Table */}
      <Card className="rounded-3xl shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-bold">{isRTL ? 'قائمة الأجنحة' : 'Booth List'}</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'البحث بالتسمية...' : 'Search...'}
                  className="ps-9 w-full sm:w-64 bg-background border-border rounded-xl"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-background border-border rounded-xl">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 opacity-60" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                  <SelectItem value="pending">{isRTL ? 'قيد الحجز' : 'Pending'}</SelectItem>
                  <SelectItem value="booked">{isRTL ? 'محجوز' : 'Booked'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">{t('common.loading')}</p>
            </div>
          ) : filteredBooths.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground bg-accent/10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted border border-border mb-4">
                <Box className="h-8 w-8 opacity-20" />
              </div>
              <p className="font-medium">{t('common.noData')}</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-bold py-4">{t('admin.editor.label')}</TableHead>
                    <TableHead className="font-bold">{isRTL ? 'النوع' : 'Type'}</TableHead>
                    <TableHead className="font-bold">{t('admin.editor.area')} (m²)</TableHead>
                    <TableHead className="font-bold">{t('admin.editor.price')}</TableHead>
                    <TableHead className="font-bold">{t('admin.status')}</TableHead>
                    <TableHead className="font-bold text-end pe-8">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooths.map((booth) => {
                    const statusCfg = STATUS_CONFIG[booth.status] || STATUS_CONFIG.available
                    const StatusIcon = statusCfg.icon
                    return (
                      <TableRow key={booth.id} className="border-border hover:bg-muted/30 transition-colors group">
                        <TableCell className="font-bold text-foreground py-4 text-base">{booth.label}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-medium">
                            standard
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{booth.area} m²</TableCell>
                        <TableCell className="font-bold text-foreground">
                          {Math.round(booth.area * 1700).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t('common.sar')}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("px-2.5 py-1 flex w-fit items-center gap-1.5", statusCfg.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {t(statusCfg.label)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2 pe-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => handleEdit(booth)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {booth.status === 'available' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-yellow-600 hover:bg-yellow-500/10 transition-colors"
                                onClick={() => handleStatusChange(booth.id, 'booked')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl text-green-600 hover:bg-green-500/10 transition-colors"
                                  onClick={() => handleStatusChange(booth.id, 'available')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                            )}

                            <AlertDialog open={deleteId === booth.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                  onClick={() => setDeleteId(booth.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-border bg-background shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold">
                                    {isRTL ? 'حذف الجناح' : 'Delete Booth'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    {isRTL
                                      ? `هل أنت متأكد من حذف الجناح "${booth.label}"؟ لا يمكن التراجع عن هذا الإجراء.`
                                      : `Are you sure you want to delete booth "${booth.label}"? This action cannot be undone.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4 gap-2">
                                  <AlertDialogCancel className="rounded-xl border-border">{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(booth.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden p-4">
              {filteredBooths.map((booth) => {
                const statusCfg = STATUS_CONFIG[booth.status] || STATUS_CONFIG.available
                const StatusIcon = statusCfg.icon
                return (
                  <Card key={booth.id} className="border-border shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground block mb-1">
                            {isRTL ? 'رقم مسلصل:' : 'ID:'} {booth.id.substring(0, 8)}
                          </span>
                          <h3 className="font-bold text-foreground text-lg">{booth.label}</h3>
                        </div>
                        <Badge variant="outline" className={cn("px-2.5 py-1 flex items-center gap-1.5", statusCfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-[10px] font-bold">{t(statusCfg.label)}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-xl">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">{isRTL ? 'المساحة' : 'Area'}</p>
                          <p className="text-sm font-black text-foreground">{booth.area} m²</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">{isRTL ? 'السعر' : 'Price'}</p>
                          <p className="text-sm font-black text-foreground">{Math.round(booth.area * 1700).toLocaleString()} <span className="text-[10px] font-normal">{t('common.sar')}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-border pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors gap-2"
                          onClick={() => handleEdit(booth)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-xs font-bold">{isRTL ? 'تعديل' : 'Edit'}</span>
                        </Button>

                        {booth.status === 'available' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl text-yellow-600 hover:bg-yellow-500/10 transition-colors gap-2"
                            onClick={() => handleStatusChange(booth.id, 'booked')}
                          >
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-bold">{isRTL ? 'حجز' : 'Book'}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl text-green-600 hover:bg-green-500/10 transition-colors gap-2"
                            onClick={() => handleStatusChange(booth.id, 'available')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-bold">{isRTL ? 'إتاحة' : 'Available'}</span>
                          </Button>
                        )}

                        <AlertDialog open={deleteId === booth.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 px-0 rounded-xl border-red-200 text-red-500 hover:bg-red-500/10 transition-colors"
                              onClick={() => setDeleteId(booth.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-border bg-background shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">
                                {isRTL ? 'حذف الجناح' : 'Delete Booth'}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                {isRTL
                                  ? `هل أنت متأكد من حذف الجناح "${booth.label}"؟ لا يمكن التراجع عن هذا الإجراء.`
                                  : `Are you sure you want to delete booth "${booth.label}"? This action cannot be undone.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 gap-2">
                              <AlertDialogCancel className="rounded-xl border-border">{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(booth.id)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                              >
                                {t('admin.booths.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Redesigned Edit Dialog - Solid Opaque Background */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg bg-background border-border p-0 overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="bg-primary/5 p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {isRTL ? `تعديل الجناح: ${editingBooth?.label}` : `Edit Booth: ${editingBooth?.label}`}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground">{t('admin.editor.label')}</Label>
                <Input
                  value={editForm.label}
                  onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                  className="bg-muted/30 border-border rounded-xl h-11 focus:ring-primary/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground">{t('admin.editor.area')} (m²)</Label>
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
                  className="bg-muted/30 border-border rounded-xl h-11"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground">{t('admin.status')}</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="bg-muted/30 border-border rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-background shadow-xl border">
                    <SelectItem value="available" className="rounded-lg">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                    <SelectItem value="pending" className="rounded-lg">{isRTL ? 'قيد الحجز' : 'Pending'}</SelectItem>
                    <SelectItem value="booked" className="rounded-lg">{isRTL ? 'محجوز' : 'Booked'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground">{t('admin.editor.type')}</Label>
                <Select
                  value={editForm.boothType}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, boothType: v }))}
                >
                  <SelectTrigger className="bg-muted/30 border-border rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-background shadow-xl border">
                    <SelectItem value="standard" className="rounded-lg">{t('admin.editor.standard')}</SelectItem>
                    <SelectItem value="vip" className="rounded-lg">{t('admin.editor.vip')}</SelectItem>
                    <SelectItem value="sponsor" className="rounded-lg">{t('admin.editor.sponsor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground">{t('admin.editor.price')} ({t('common.sar')})</Label>
              <Input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                }
                className="bg-muted/30 border-border rounded-xl h-11 text-lg font-bold text-primary"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-6 px-8 flex gap-3">
            <Button variant="ghost" className="rounded-xl h-11 px-6 font-medium" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl h-11 px-8 font-bold min-w-[120px]"
              onClick={handleEditSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
