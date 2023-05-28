import React, { FC, InputHTMLAttributes } from 'react'
import { useField } from 'formik'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react'

type TProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  textArea?: boolean
}

export const InputField: FC<TProps> = ({ size: _, textArea, ...props }) => {
  let InputOrTextarea = Input
  if (textArea) {
    InputOrTextarea = Textarea
  }
  const [field, { error }] = useField(props)
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      <InputOrTextarea
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : ''}
    </FormControl>
  )
}
