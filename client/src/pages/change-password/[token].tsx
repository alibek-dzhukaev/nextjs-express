import React, { useState } from 'react'
import { Form, Formik } from 'formik'
import { InputField } from '../../components/InputField'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import Wrapper from '../../components/Wrapper'
import { useRouter } from 'next/router'
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'
import NextLink from 'next/link'
import { routes } from '../../utils/routes'
import { withApollo } from '../../utils/withApollo'

const ChangePassword = () => {
  const router = useRouter()
  const [changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')

  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token: router.query.token === 'string' ? router.query.token : '',
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              })
            },
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            // worked
            await router.push(routes.home)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label='New password'
              placeholder='new password'
              name='newPassword'
              type='password'
            />
            {tokenError && (
              <Flex>
                <Box mr={2} color='red'>
                  {tokenError}
                </Box>
                <NextLink href={routes.forgotPassword}>
                  <Link>Click here to get new one</Link>
                </NextLink>
              </Flex>
            )}
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(ChangePassword)
