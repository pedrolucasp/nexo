import { vi } from 'vitest'

// multer-s3 (and the S3 client) is replaced by this middleware in tests, so
// the avatar specs can stage the file the controller will read off req.file
let uploadedFile: unknown = null

export function setUploadedFile(file: unknown) {
  uploadedFile = file
}

export function resetAvatarMock() {
  uploadedFile = null

  avatarMulterMock.single.mockClear()
}

export const avatarMulterMock = {
  single: vi.fn(
    () => (req: any, _res: any, next: any) => {
      if (uploadedFile) {
        req.file = uploadedFile
      }

      next()
    },
  ),
}
