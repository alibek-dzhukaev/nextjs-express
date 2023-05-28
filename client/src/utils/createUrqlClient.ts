import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from 'urql'
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache'
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql'
import { betterUpdateQuery } from './betterUpdateQuery'
import { SSRExchange } from 'next-urql'
import { gql } from '@urql/core'
import { pipe, tap } from 'wonka'
import { routes } from './routes'
import Router from 'next/router'
import { isServer } from './isServer'

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(async ({ error }) => {
        if (error?.message.includes('not authenticated')) {
          await Router.replace(routes.login)
        }
      })
    )
  }

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info
    const allFields = cache.inspectFields(entityKey)
    const fieldInfos = allFields.filter((info) => {
      return info.fieldName === fieldName
    })
    const size = fieldInfos.length
    if (size === 0) {
      return undefined
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts'
    )
    info.partial = !isItInTheCache
    let hasMore = true
    const results: string[] = []
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      const _hasMore = cache.resolve(key, 'hasMore') as boolean
      if (!_hasMore) hasMore = _hasMore
      results.push(...data)
    })

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    }
  }
}

const invalidateAllPosts = (cache: Cache) => {
  const QUERY = 'Query'
  const FIELD_NAME = 'posts'

  const allFields = cache.inspectFields(QUERY)
  const fieldInfos = allFields.filter((info) => {
    return info.fieldName === FIELD_NAME
  })
  fieldInfos.forEach((fi) => {
    cache.invalidate(QUERY, FIELD_NAME, fi.arguments)
  })
}

export const createUrqlClient = (ssrExchange: SSRExchange, ctx: any) => {
  let cookie = ''
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie
  }
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_, __, cache) => {
              // cache.invalidate({
              //   __typename: 'Post',
              //   id: (args as DeletePostMutationVariables).deletePostId,
              // })
              invalidateAllPosts(cache)
            },
            vote: (_, args, cache) => {
              const { postId, value } = args as VoteMutationVariables

              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              )
              if (data) {
                if (data.voteStatus === value) return

                const newPoints =
                  data.points + (!data.voteStatus ? 1 : 2) * value
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                )
              }
            },
            createPost: (_, __, cache) => {
              invalidateAllPosts(cache)
            },
            logout: (_result, _, cache) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              )
            },
            login: (_result, _, cache) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query
                  } else {
                    return {
                      me: result.login.user,
                    }
                  }
                }
              )
              invalidateAllPosts(cache)
            },
            register: (_result, _, cache) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query
                  } else {
                    return {
                      me: result.register.user,
                    }
                  }
                }
              )
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  }
}
