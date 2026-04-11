'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Map,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import FloorPlanEditor, { type BoothShape } from './FloorPlanEditor'
import ErrorBoundary from '@/components/ErrorBoundary'

interface FloorPlan {
  id: string
  name: string
  description?: string
  booths: BoothShape[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FloorPlanManager() {
  const { t, isRTL } = useTranslation()
  const [plans, setPlans] = useState<FloorPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<FloorPlan | null>(null)
  const [previewPlan, setPreviewPlan] = useState<FloorPlan | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/floor-plans')
      const data = await res.json()
      if (data.success) {
        setPlans(Array.isArray(data.data) ? data.data : [])
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleCreate = () => {
    setEditingPlan(null)
    setEditorOpen(true)
  }

  const handleEdit = (plan: FloorPlan) => {
    setEditingPlan(plan)
    setEditorOpen(true)
  }

  const handleDelete = async (plan: FloorPlan) => {
    const prevPlans = [...plans];
    
    // Optimistic Update
    setPlans(prev => prev.filter(p => p.id !== plan.id));

    try {
      const res = await fetch(`/api/floor-plans/${plan.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
      } else {
        // Rollback
        setPlans(prevPlans);
        toast.error(data.error || t('common.error'))
      }
    } catch {
      // Rollback
      setPlans(prevPlans);
      toast.error(t('common.error'))
    }
  }

  const handleToggleActive = async (plan: FloorPlan) => {
    const prevPlans = [...plans];
    
    // Optimistic Update: Toggle target and potentially deactivate others (if backend does that)
    const newStatus = !plan.isActive;
    setPlans(prev => prev.map(p => {
      if (p.id === plan.id) return { ...p, isActive: newStatus };
      // If we are activating this one, the others might become inactive
      if (newStatus && p.isActive) return { ...p, isActive: false };
      return p;
    }));

    try {
      const res = await fetch(`/api/floor-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        // Updated successfully
      } else {
        // Rollback
        setPlans(prevPlans);
        toast.error(data.error || t('common.error'))
      }
    } catch {
      // Rollback
      setPlans(prevPlans);
      toast.error(t('common.error'))
    }
  }

  const handleEditorSave = async (booths: BoothShape[], name: string): Promise<boolean> => {
    try {
      if (editingPlan) {
        // Editing: update name, delete old booths, create new booths
        const patchRes = await fetch(`/api/floor-plans/${editingPlan.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const patchData = await patchRes.json()
        if (!patchData.success) {
          toast.error(patchData.error || t('common.error'))
          return false
        }

        // Delete all old non-booked booths on this floor plan
        const oldBooths = editingPlan.booths || []
        await Promise.all(
          oldBooths
            .filter((b: BoothShape) => b.status !== 'booked')
            .map((b: BoothShape) =>
              fetch(`/api/booths/${b.id}`, { method: 'DELETE' }).catch(() => null)
            )
        )

        // Create new booths
        for (const booth of booths) {
          await fetch(`/api/floor-plans/${editingPlan.id}/booths`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              label: booth.label,
              area: booth.area,
              status: booth.status || 'available',
              boothType: booth.boothType,
              price: booth.price,
              x: booth.x,
              y: booth.y,
              width: booth.width,
              height: booth.height,
            }),
          })
        }

        setEditorOpen(false)
        fetchPlans()
        return true
      } else {
        // Creating: POST new floor plan with booths
        const res = await fetch('/api/floor-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            booths: booths.map((b) => ({
              label: b.label,
              area: b.area,
              status: b.status || 'available',
              boothType: b.boothType,
              price: b.price,
              x: b.x,
              y: b.y,
              width: b.width,
              height: b.height,
            })),
          }),
        })
        const data = await res.json()
        if (data.success) {
          setEditorOpen(false)
          fetchPlans()
          return true
        }
        toast.error(data.error || t('common.error'))
        return false
      }
    } catch {
      toast.error(t('common.error'))
      return false
    }
  }

  const renderMiniPreview = (booths: BoothShape[]) => {
    if (booths.length === 0) {
      return (
        <div className="flex h-28 w-full items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400">
          {t('common.noData')}
        </div>
      )
    }

    const padding = 8
    const minX = Math.min(...booths.map((b) => b.x))
    const minY = Math.min(...booths.map((b) => b.y))
    const maxX = Math.max(...booths.map((b) => b.x + b.width))
    const maxY = Math.max(...booths.map((b) => b.y + b.height))
    const rangeW = maxX - minX || 1
    const rangeH = maxY - minY || 1
    const svgW = 240
    const svgH = 112
    const scaleX = (svgW - padding * 2) / rangeW
    const scaleY = (svgH - padding * 2) / rangeH
    const scale = Math.min(scaleX, scaleY)

    const typeColors: Record<string, string> = {
      standard: '#3b82f6',
      vip: '#d97706',
      sponsor: '#7c3aed',
    }

    return (
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-28 w-full rounded-md bg-gray-50">
        {booths.map((booth) => (
          <rect
            key={booth.id}
            x={padding + (booth.x - minX) * scale}
            y={padding + (booth.y - minY) * scale}
            width={booth.width * scale}
            height={booth.height * scale}
            fill={`${typeColors[booth.boothType] || typeColors.standard}22`}
            stroke={typeColors[booth.boothType] || typeColors.standard}
            strokeWidth={1}
            rx={2}
          />
        ))}
      </svg>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        isRTL ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Map className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? 'إدارة مخططات الأرضية' : 'Floor Plan Management'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL ? 'إنشاء وتعديل مخططات معرض الأجنحة' : 'Create and edit exhibition floor plans'}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          {t('admin.plans.createPlan')}
        </Button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Map className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {isRTL ? 'لا توجد مخططات' : 'No floor plans yet'}
            </p>
            <p className="mb-4 text-sm text-gray-400">
              {isRTL ? 'ابدأ بإنشاء مخطط أرضية جديد' : 'Create your first floor plan to get started'}
            </p>
            <Button onClick={handleCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t('admin.plans.createPlan')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const boothCount = plan.booths?.length || 0
            const totalArea = plan.booths?.reduce((s: number, b: BoothShape) => s + b.area, 0) || 0
            const available = plan.booths?.filter((b: BoothShape) => b.status === 'available').length || 0
            const booked = plan.booths?.filter((b: BoothShape) => b.status === 'booked').length || 0

            return (
              <Card key={plan.id} className="overflow-hidden">
                {/* Preview */}
                <div className="cursor-pointer" onClick={() => setPreviewPlan(plan)}>
                  {renderMiniPreview(plan.booths || [])}
                </div>

                <CardContent className="p-4">
                  {/* Title & Status */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-800">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{formatDate(plan.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`switch-${plan.id}`} className="text-xs text-gray-400">
                        {plan.isActive ? t('admin.plans.active') : t('admin.plans.inactive')}
                      </Label>
                      <Switch
                        id={`switch-${plan.id}`}
                        checked={plan.isActive}
                        onCheckedChange={() => handleToggleActive(plan)}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-gray-50 px-2 py-1.5">
                      <p className="text-xs text-gray-400">{t('admin.plans.boothCount')}</p>
                      <p className="font-bold text-gray-700">{boothCount}</p>
                    </div>
                    <div className="rounded-md bg-green-50 px-2 py-1.5">
                      <p className="text-xs text-green-600">
                        {isRTL ? 'متاح' : 'Available'}
                      </p>
                      <p className="font-bold text-green-700">{available}</p>
                    </div>
                    <div className="rounded-md bg-orange-50 px-2 py-1.5">
                      <p className="text-xs text-blue-700">
                        {isRTL ? 'محجوز' : 'Booked'}
                      </p>
                      <p className="font-bold text-orange-700">{booked}</p>
                    </div>
                  </div>

                  {/* Type badges */}
                  {plan.booths && plan.booths.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {(['standard', 'vip', 'sponsor'] as const).map((type) => {
                        const count = plan.booths.filter((b: BoothShape) => b.boothType === type).length
                        if (count === 0) return null
                        const colors: Record<string, string> = {
                          standard: 'bg-blue-50 text-blue-700 border-blue-200',
                          vip: 'bg-amber-50 text-amber-700 border-amber-200',
                          sponsor: 'bg-purple-50 text-purple-700 border-purple-200',
                        }
                        return (
                          <Badge key={type} variant="outline" className={`text-xs ${colors[type]}`}>
                            {t(`admin.editor.${type}`)} ({count})
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleEdit(plan)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('admin.plans.editPlan')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={() => setPreviewPlan(plan)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isRTL ? 'حذف المخطط' : 'Delete Floor Plan'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isRTL
                              ? `هل أنت متأكد من حذف المخطط "${plan.name}"؟`
                              : `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(plan)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="me-1 h-4 w-4" />
                            {t('admin.plans.deletePlan')}
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
      )}

      {/* Editor - Full Screen Overlay */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
          {/* Editor Header Bar */}
          <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-gray-900 px-4 shadow-sm">
            <Map className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-white">
              {editingPlan
                ? isRTL
                  ? `تعديل: ${editingPlan.name}`
                  : `Edit: ${editingPlan.name}`
                : t('admin.plans.createPlan')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="ms-auto h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white"
              onClick={() => setEditorOpen(false)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
          {/* Editor Content - fills remaining space */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ErrorBoundary>
              <FloorPlanEditor
                planId={editingPlan?.id}
                planName={editingPlan?.name}
                initialBooths={editingPlan?.booths || []}
                onSave={handleEditorSave}
                onCancel={() => setEditorOpen(false)}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewPlan} onOpenChange={() => setPreviewPlan(null)}>
        <DialogContent className="flex h-[90vh] max-w-none w-[96vw] flex-col gap-0 p-0 sm:!max-w-none">
          <DialogHeader>
            <DialogTitle>{previewPlan?.name}</DialogTitle>
          </DialogHeader>
          {previewPlan && (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge variant="outline">
                  {previewPlan.booths?.length || 0} {isRTL ? 'جناح' : 'booths'}
                </Badge>
                <Badge variant="outline">
                  {(previewPlan.booths?.reduce((s: number, b: BoothShape) => s + b.area, 0) || 0).toFixed(1)} m²
                </Badge>
                <Badge className={previewPlan.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                  {previewPlan.isActive ? t('admin.plans.active') : t('admin.plans.inactive')}
                </Badge>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-gray-50">
                <FloorPlanEditor
                  initialBooths={previewPlan.booths || []}
                  planName={previewPlan.name}
                />
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0 border-t px-4 py-3">
            <Button variant="outline" onClick={() => setPreviewPlan(null)}>
              {t('common.close')}
            </Button>
            {previewPlan && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setPreviewPlan(null)
                  handleEdit(previewPlan)
                }}
              >
                <Pencil className="me-2 h-4 w-4" />
                {t('admin.plans.editPlan')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
