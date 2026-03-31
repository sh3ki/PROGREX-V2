import { NextRequest, NextResponse } from 'next/server'
import { generateInvoicePdf, getProjectInvoicePayload, getSinglePaymentInvoicePayload } from '@/lib/server/paymentInvoice'

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get('paymentId')?.trim()
    const projectId = req.nextUrl.searchParams.get('projectId')?.trim()

    if (!paymentId && !projectId) {
      return NextResponse.json({ error: 'Missing invoice target.' }, { status: 400 })
    }

    const payload = paymentId
      ? await getSinglePaymentInvoicePayload(paymentId)
      : await getProjectInvoicePayload(projectId || '')

    if (!payload) {
      return NextResponse.json({ error: 'Invoice data not found.' }, { status: 404 })
    }

    const bytes = await generateInvoicePdf(payload)
    const pdfBuffer = Uint8Array.from(bytes)

    return new NextResponse(pdfBuffer.buffer, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `inline; filename="${payload.invoiceNumber}.pdf"`,
        'cache-control': 'no-store',
      },
    })
  } catch (error) {
    console.error('invoice route error', error)
    return NextResponse.json({ error: 'Failed to generate invoice.' }, { status: 500 })
  }
}
