import { useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { routes } from './routes'

export const useIsAuth = () => {
  const { data, loading } = useMeQuery()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace(routes.login + '?next=' + router.pathname)
    }
  }, [data, loading, router])
}
