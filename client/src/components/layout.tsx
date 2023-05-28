import React, { FC } from 'react'
import Wrapper, { WrapperVariant } from './Wrapper'
import Navbar from './Navbar'

type TProps = {
  variant?: WrapperVariant
}

const Layout: FC<TProps> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  )
}

export default Layout
