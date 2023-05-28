import React, { FC, Fragment } from 'react'
import NextLink from 'next/link'
import { routes } from '../utils/routes'
import { IconButton, Link } from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql'

type TProps = {
  id: number
  creatorId: number
}

const EditDeletePostButtons: FC<TProps> = ({ id, creatorId }) => {
  const [deletePost] = useDeletePostMutation()
  const { data: meData } = useMeQuery()

  if (meData?.me?.id !== creatorId) {
    return null
  }

  return (
    <Fragment>
      <NextLink href={routes.editPost} as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          color='white'
          colorScheme='blue'
          aria-label='Edit Post'
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        onClick={() => {
          return deletePost({
            variables: { deletePostId: id },
            update: (cache) => {
              cache.evict({ id: 'Post:' + id })
            },
          })
        }}
        color='white'
        colorScheme='blue'
        aria-label='Delete Post'
        icon={<DeleteIcon />}
      />
    </Fragment>
  )
}

export default EditDeletePostButtons
