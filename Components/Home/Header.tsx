import React from 'react'
import { Chevron_Down, Login_icon, Magnifier, MersehSvg, Shop_Cart } from './SVGS'

export default function Header() {
    return (
        <header className='h-[116px] px-6 w-full  flex items-center mb-[-70px]'>
            <div className='flex items-center gap-12 basis-4/6  h-full '>

                <MersehSvg classname='max-w-[38px] basis-1/12 flex-none' />
                <div className=' basis-3/12 flex-none'>
                    <div className='flex flex-row justify-center  items-center gap-2 cursor-pointer'>
                        <span className='font-[400] text-black1 text-[14px] '>دسته‌بندی کالاها</span>
                        <Chevron_Down classname='w-[11px]  fill-[#303030]'/>
                    </div>
                </div>

                <div className=' grow h-[50px] relative'>
                    <input placeholder='جستجو در میان محصولات' className='bg-[#F6F6F6] w-full h-full placeholder:text-[15px] text-black1 placeholder:text-[#8b8b8b] px-5 pr-[50px] grow rounded-[10px] appearance-none outline-none' />
                    <Magnifier classname='absolute top-[15px] right-[15px]'/>
                </div>
            </div>
            <div className='basis-2/6 flex flex-row justify-end gap-10 items-center'>
                <div className='flex flex-row justify-center items-center gap-2 hover:bg-hover1  px-4 py-2 rounded-[10px] cursor-pointer'>
                    <span className='text-[14px] text-black1 font-[400]'>ورود | عضویت</span>
                    <Login_icon classname='w-[15px] mt-[2px]'/>
                </div>
                <div className='p-3 hover:bg-hover1 cursor-pointer rounded-[15px]'>

                    <Shop_Cart classname=' ' />
                </div>
            </div>
        </header>
    )
}
