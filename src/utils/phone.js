export const normalizePhoneNumber = (value = '') =>
  String(value).trim().replace(/[\s().-]/g, '')

export const isValidCameroonPhoneNumber = (value = '') => {
  const normalized = normalizePhoneNumber(value)
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized

  if (!/^\d+$/.test(digits)) return false

  if (/^237[2-9]\d{8}$/.test(digits)) return true
  if (/^[2-9]\d{8}$/.test(digits)) return true

  return false
}

export const formatPhoneHint = (value = '') => normalizePhoneNumber(value) || '+237 6XX XXX XXX'
