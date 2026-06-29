import { Router, Response, NextFunction } from 'express'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { z } from 'zod'
import { requireAuth, AuthenticatedRequest } from '@app/middleware/auth'
import { buildReportData } from './report.data'
import ReportDocument from './ReportDocument'

const router = Router()

const ReportSchema = z
  .object({
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine(
    (d) => {
      const start = new Date(d.periodStart)
      const end = new Date(d.periodEnd)
      const diff = (end.getTime() - start.getTime()) / 86_400_000
      return diff > 0 && diff <= 90
    },
    { message: 'periodEnd must be after periodStart and range ≤ 90 days' },
  )

router.post(
  '/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = ReportSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' })
      }

      const { periodStart, periodEnd } = parsed.data
      const data = await buildReportData(
        req.userId!,
        new Date(periodStart),
        new Date(periodEnd),
      )

      const element = React.createElement(ReportDocument, { data })
      const buffer = await renderToBuffer(
        element as React.ReactElement<any>,
      )

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Nexo-report-${periodStart.slice(0, 7)}.pdf"`,
      )
      return res.send(buffer)
    } catch (err) {
      return next(err)
    }
  },
)

export default router
