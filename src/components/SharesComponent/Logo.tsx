import React from 'react'
import Image from "next/image";


const Logo = () => {
  return (
    <>
             <Image
               src="/assets/images/logo/logo-dark.png"
               alt="Logo Dark"
               width={100}
               height={100}
               className="hidden dark:block" // Show dark logo in dark mode
             />

             <Image
              src="/assets/images/logo/logo-white.png"
               alt="Logo White"
               width={100}
               height={100}
               className="dark:hidden" // Show white logo in light mode
             />

    </>
  )
}

export default Logo