import React, { FC, useState } from 'react'
import { Flex, IconButton } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql'
import { gql } from '@urql/core'
import { ApolloCache } from '@apollo/client'

type TProps = {
  post: PostSnippetFragment
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number
    points: number
    voteStatus: number | null
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  })
  if (data) {
    if (data.voteStatus === value) return

    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    })
  }
}

const UpdootSection: FC<TProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'no-loading'
  >('no-loading')
  const [vote] = useVoteMutation()

  return (
    <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return
          setLoadingState('updoot-loading')
          await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          })
          setLoadingState('no-loading')
        }}
        isLoading={loadingState === 'updoot-loading'}
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        icon={<ChevronUpIcon />}
        aria-label='updoot post'
        boxSize={8}
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return
          setLoadingState('downdoot-loading')
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          })
          setLoadingState('no-loading')
        }}
        isLoading={loadingState === 'downdoot-loading'}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        icon={<ChevronDownIcon />}
        aria-label='downdoot post'
        boxSize={8}
      />
    </Flex>
  )
}

export default UpdootSection
