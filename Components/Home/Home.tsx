"use client"
import { trpc } from '@/utils/trpc'
import React from 'react'
import Header from './Header'
import Slider from './Slider'
import Main_Categories from './Main_Categories'
import ProductCarousel from './ProductCarousel'
import Footer from './Footer'
import localFont from 'next/font/local'


 
const IRANYekanXFaNum = localFont({
  src: [
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-Thin.woff2',
      weight: '100',
      style:'sans'
    },
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-UltraLight.woff2',
      weight: '200',
    },
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-Light.woff2',
      weight: '300',
    },
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-Medium.woff2',
      weight: '500',
    },
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-Bold.woff2',
      weight: 'bold',
    },
    {
      path: '../../public/fonts/Iranyekan_x_pro/woff2/IRANYekanXFaNum-Regular.woff2',
      weight: 'normal',
    },

  ],
});  
export default function Home() {
  const { data } = trpc.hello.useQuery()
  return (
    <main className={`justify-center items-center flex  bg-white w-screen overflow-hidden ${IRANYekanXFaNum.className}`}>
      <div className='max-w-[1400px] gap-16 w-full flex-col justify-center items-center flex bg-white'>

        <Header />
        <Slider />
        <Main_Categories />
        <ProductCarousel key={"popular_products"} title='محبوب ترین محصولات' sliderStartDelay={5000}/>
        <div className='h-[221px] w-full rounded-[10px] px-4 bg-gray-100'></div>
        <ProductCarousel key={"off_products"} title='تخفیف دار ها' sliderStartDelay={8000}/>
        <Footer />
      </div>
    </main>
  )
}
