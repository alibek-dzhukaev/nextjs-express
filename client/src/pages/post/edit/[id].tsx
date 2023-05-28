import React from 'react'
import Layout from '../../../components/layout'
import { Form, Formik } from 'formik'
import { InputField } from '../../../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql'
import { useGetPostId } from '../../../utils/useGetPostId'
import { useRouter } from 'next/router'
import { withApollo } from '../../../utils/withApollo'

const EditPost = () => {
  const router = useRouter()
  const postId = useGetPostId()
  const { data, error, loading } = usePostQuery({
    skip: postId === -1,
    variables: {
      postId,
    },
  })
  const [updatePost] = useUpdatePostMutation()

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    )
  }

  if (error) {
    return <div>{error.message}</div>
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    )
  }

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ variables: { updatePostId: postId, ...values } })
          await router.back()
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
              update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withApollo({ ssr: false })(EditPost)
