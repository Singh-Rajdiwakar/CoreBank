import { useQuery } from '@tanstack/react-query'
import { listMyAccounts } from '../api/accounts'
import { listMyCards } from '../api/cards'

export function useCustomerAccounts() {
  const accountsQ = useQuery({
    queryKey: ['accounts'],
    queryFn: () => listMyAccounts({ page: 0, size: 100 }),
  })

  return accountsQ.data?.content ?? []
}

export function useCustomerCards() {
  const cardsQ = useQuery({
    queryKey: ['cards'],
    queryFn: () => listMyCards({ page: 0, size: 100 }),
  })

  return cardsQ.data?.content ?? []
}
