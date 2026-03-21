import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { getCustomerDocuments, uploadCustomerDocument, getMyProfile } from '../../api/customers'
import type { DocumentType } from '../../api/customers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

const DOCUMENT_TYPES: DocumentType[] = [
  'PAN',
  'AADHAAR',
  'PASSPORT',
  'DRIVING_LICENSE',
  'VOTER_ID',
  'UTILITY_BILL',
  'BANK_STATEMENT',
]

export default function CustomerDocumentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    documentType: '' as DocumentType,
    documentNumber: '',
    fileName: '',
    fileUrl: '',
  })

  const profileQ = useQuery({
    queryKey: ['profile'],
    queryFn: getMyProfile,
  })

  const documentsQ = useQuery({
    queryKey: ['documents', profileQ.data?.id],
    queryFn: () => getCustomerDocuments(profileQ.data!.id),
    enabled: !!profileQ.data?.id,
  })

  const uploadMut = useMutation({
    mutationFn: () =>
      uploadCustomerDocument(profileQ.data!.id, formData),
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      documentsQ.refetch()
      setFormData({
        documentType: '' as DocumentType,
        documentNumber: '',
        fileName: '',
        fileUrl: '',
      })
      setShowForm(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    },
  })

  const documents = documentsQ.data ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Documents</h1>
          <p className="mt-1 text-sm text-muted">Upload and manage your documents</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ Upload Document'}
        </Button>
      </header>

      {showForm && (
        <div className="surface p-6 space-y-4">
          <h2 className="font-semibold">Upload Document</h2>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold mb-2">Document Type</label>
              <select
                value={formData.documentType}
                onChange={(e) =>
                  setFormData({ ...formData, documentType: e.target.value as DocumentType })
                }
                className="input w-full"
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Document Number"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            />
            <Input
              placeholder="File Name"
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
            />
            <Input
              placeholder="File URL / S3 Path"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            />
            <Button
              onClick={() => uploadMut.mutate()}
              disabled={
                uploadMut.isPending ||
                !formData.documentType ||
                !formData.documentNumber ||
                !formData.fileName
              }
              variant="primary"
              className="gap-2"
            >
              {uploadMut.isPending && <Spinner className="h-4 w-4" />}
              Upload
            </Button>
          </div>
        </div>
      )}

      {documentsQ.isLoading ? (
        <div className="surface p-6 flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading documents...
        </div>
      ) : documents.length > 0 ? (
        <div className="surface p-6 space-y-3">
          <h2 className="font-semibold">Your Documents ({documents.length})</h2>
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-black/5"
              >
                <div className="flex-1">
                  <p className="font-semibold">{doc.documentType}</p>
                  <p className="text-sm text-muted mt-1">
                    Number: {doc.documentNumber}
                  </p>
                  <p className="text-xs text-muted mt-1">{doc.fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      doc.verificationStatus === 'VERIFIED'
                        ? 'success'
                        : doc.verificationStatus === 'REJECTED'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {doc.verificationStatus}
                  </Badge>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="surface p-6 text-center text-sm text-muted">
          No documents uploaded yet
        </div>
      )}
    </div>
  )
}
