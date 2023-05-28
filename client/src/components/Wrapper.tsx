import React, { FC } from 'react'
import { Box } from '@chakra-ui/react'

export type WrapperVariant = 'small' | 'regular'

type TProps = {
  variant?: WrapperVariant
}

const Wrapper: FC<TProps> = ({ children, variant = 'regular' }) => {
  return (
    <Box maxW={variant === 'regular' ? 800 : 400} w='100%' mt={8} mx='auto'>
      {children}
    </Box>
  )
}

export default Wrapper
