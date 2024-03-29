import Layout from '../components/layout'
import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { routes } from '../utils/routes'
import { usePostsQuery } from '../generated/graphql'
import UpdootSection from '../components/UpdootSection'
import EditDeletePostButtons from '../components/EditDeletePostButtons'
import { withApollo } from '../utils/withApollo'

const Index = () => {
  const { data, error, loading, fetchMore } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null as string | null,
    },
    notifyOnNetworkStatusChange: true,
  })

  if (!loading && !data) {
    return (
      <Box>
        <Text>your got query failed for some reason</Text>
        <div>{error?.message}</div>
      </Box>
    )
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
                <UpdootSection post={p} />
                <Box flex={1}>
                  <NextLink href={routes.post} as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize='xl'>{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex>
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    <Box ml='auto'>
                      <EditDeletePostButtons
                        id={p.id}
                        creatorId={p.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={async () => {
              await fetchMore({
                variables: {
                  limit: 15,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (prevValue, { fetchMoreResult }) => {
                //   if (!fetchMoreResult) {
                //     return prevValue
                //   }
                //
                //   return {
                //     __typename: 'Query',
                //     posts: {
                //       __typename: 'PaginatedPosts',
                //       hasMore: fetchMoreResult.posts.hasMore,
                //       posts: [
                //         ...prevValue.posts.posts,
                //         ...fetchMoreResult.posts.posts,
                //       ],
                //     },
                //   }
                // },
              })
            }}
            isLoading={loading}
            m='auto'
            my={8}
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

export default withApollo({ ssr: true })(Index)
