export const PRODUCTION_DOMAIN = 'creatopedia.tech'
export const LOCAL_DOMAIN = 'localhost'

/**
 * Centrally resolves the base domain based on a given hostname.
 * Falls back to check window.location.hostname if no hostname is passed (on the client).
 */
export function getBaseDomain(hostname?: string): string {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '')
  const hostWithoutPort = host.split(':')[0]

  if (hostWithoutPort.endsWith('.creatopedia.tech') || hostWithoutPort === 'creatopedia.tech') {
    return 'creatopedia.tech'
  }
  if (hostWithoutPort.endsWith('.localhost') || hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return 'localhost'
  }
  return 'creatopedia.tech'
}
