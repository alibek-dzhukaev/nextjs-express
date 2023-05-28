import React, { Fragment } from 'react'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'
import { routes } from '../utils/routes'
import { useApolloClient } from '@apollo/client'

const Navbar = () => {
  const [logout] = useLogoutMutation()
  const apolloClient = useApolloClient()
  const { data, loading } = useMeQuery({
    skip: isServer(),
  })

  let body = null

  if (loading) {
  } else if (!data?.me) {
    body = (
      <Fragment>
        <NextLink href={routes.login}>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href={routes.register}>
          <Link>Register</Link>
        </NextLink>
      </Fragment>
    )
  } else {
    body = (
      <Flex align='center'>
        <NextLink href={routes.createPost}>
          <Button as={Link} mr={4}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant='link'
          onClick={async () => {
            await logout()
            await apolloClient.resetStore()
          }}
        >
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex position='sticky' top={0} zIndex={1} bg='tan' p={4} align='center'>
      <Flex maxW={800} align='center' flex={1} m='auto'>
        <NextLink href={routes.home}>
          <Link>
            <Heading>Li Reddit</Heading>
          </Link>
        </NextLink>
        <Box ml='auto'>{body}</Box>
      </Flex>
    </Flex>
  )
}

export default Navbar
