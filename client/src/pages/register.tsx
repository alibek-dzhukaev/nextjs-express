import { Form, Formik } from 'formik'
import React from 'react'
import { Box, Button } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql'
import { routes } from '../utils/routes'
import { withApollo } from '../utils/withApollo'

const Register = () => {
  const router = useRouter()
  const [register] = useRegisterMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { registerOptions: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              })
            },
          })
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
            //worked
            await router.push(routes.home)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label='Username'
              placeholder='username'
              name='username'
            />
            <Box mt={4}>
              <InputField
                label='Email'
                placeholder='email'
                name='email'
                type='email'
              />
            </Box>
            <Box mt={4}>
              <InputField
                label='Password'
                placeholder='password'
                name='password'
                type='password'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(Register)
