const DEMO_CUSTOMER_PREFIX = '20000000-0000-0000-0000-'

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function isCustomerCode(value: string) {
  return /^C\d{3,}$/i.test(value)
}

export function customerHref(customer: { id: string; kode_customer?: string | null }) {
  if (customer.kode_customer) {
    return `/customers/${customer.kode_customer.toUpperCase()}`
  }

  if (customer.id.startsWith(DEMO_CUSTOMER_PREFIX)) {
    const sequence = Number(customer.id.slice(-3))
    if (Number.isInteger(sequence) && sequence > 0) {
      return `/customers/C${sequence.toString().padStart(3, '0')}`
    }
  }

  return `/customers/${customer.id}`
}

export function demoCustomerIdFromCode(value: string) {
  if (!isCustomerCode(value)) {
    return null
  }

  const sequence = Number(value.slice(1))
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999999999999) {
    return null
  }

  return `${DEMO_CUSTOMER_PREFIX}${sequence.toString().padStart(12, '0')}`
}

export function applyCustomerLookup(query: any, idOrCode: string) {
  if (isUuid(idOrCode)) {
    return query.eq('id', idOrCode)
  }

  if (isCustomerCode(idOrCode)) {
    return query.eq('id', demoCustomerIdFromCode(idOrCode) || idOrCode)
  }

  return query.eq('kode_customer', idOrCode.toUpperCase())
}
