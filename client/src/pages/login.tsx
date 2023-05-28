import { Form, Formik } from 'formik'
import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql'
import { routes } from '../utils/routes'
import NextLink from 'next/link'
import { withApollo } from '../utils/withApollo'

const Login = () => {
  const router = useRouter()
  const [login] = useLoginMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
              })
              cache.evict({ fieldName: 'posts:{}' })
            },
          })
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              await router.push(router.query.next)
            } else {
              await router.push(routes.home)
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label='Username or Email'
              placeholder='username or email'
              name='usernameOrEmail'
            />
            <Box mt={4}>
              <InputField
                label='Password'
                placeholder='password'
                name='password'
                type='password'
              />
            </Box>
            <Flex mt={2}>
              <NextLink href={routes.forgotPassword}>
                <Link ml='auto'>forgot password?</Link>
              </NextLink>
            </Flex>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(Login)
