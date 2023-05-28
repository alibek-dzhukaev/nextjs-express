import React, { FC, useState } from 'react'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { withApollo } from '../utils/withApollo'

const ForgotPassword: FC = () => {
  const [complete, setComplete] = useState(false)
  const [forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant={'small'}>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values })
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              if an account with that email exists, we sent you am email
            </Box>
          ) : (
            <Form>
              <InputField
                label='Email'
                placeholder='email'
                name='email'
                type='email'
              />
              <Button
                mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'
              >
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(ForgotPassword)
