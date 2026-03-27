import React from 'react'
import Image from "next/image";


const Logo = () => {
  return (
    <>
             <Image
               src="/assets/images/logo/logo-dark.svg"
               alt="Logo White"
               width={100}
               height={100}
               className="dark:hidden" // هذا سيخفي الصورة في الوضع المظلم
             />

             <Image
              src="/assets/images/logo/logo-white.svg"
              
               alt="Logo Dark"
               width={100}
               height={100}
               className="hidden dark:block" // هذا سيخفي الصورة في الوضع الفاتح
             />

    </>
  )
}

export default Logo