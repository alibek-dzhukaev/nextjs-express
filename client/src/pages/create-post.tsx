import React, { FC } from 'react'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import { useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import { routes } from '../utils/routes'
import Layout from '../components/layout'
import { useIsAuth } from '../utils/useIsAuth'
import { withApollo } from '../utils/withApollo'

const CreatePost: FC = () => {
  const router = useRouter()
  useIsAuth()

  const [createPost] = useCreatePostMutation()
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: 'posts' })
            },
          })
          if (!errors) {
            await router.push(routes.home)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField label='Title' placeholder='title' name='title' />
            <Box mt={4}>
              <InputField
                textArea
                label='Body'
                placeholder='text...'
                name='text'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withApollo({ ssr: false })(CreatePost)
