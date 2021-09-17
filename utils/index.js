export const TYPE = {
  pending: 'PENDING',
  success: 'SUCCESS',
  error: 'ERROR',
}

export function abbrAddress(address) {
  if (address && address.length === 42) {
    const start = address.substring(0, address.length - 36)
    const end = address.substring(38)
    return `${start}...${end}`
  }
  return address
}
