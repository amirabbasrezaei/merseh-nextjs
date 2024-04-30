"use client"
import { trpc } from '@/utils/trpc'
import React from 'react'
import Header from './Header'
import Slider from './Slider'
import Main_Categories from './Main_Categories'
import ProductCarousel from './ProductCarousel'
import Footer from './Footer'

export default function Home() {
  const { data } = trpc.hello.useQuery()
  return (
    <main className='justify-center items-center flex  bg-white w-screen overflow-hidden'>
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
