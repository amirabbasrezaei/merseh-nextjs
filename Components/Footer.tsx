import React from 'react'
import { MersehSvg } from './Home/SVGS'

export default function Footer() {
    return (
        <footer className='h-[253px] max-w-[1400px] relative w-full items-center flex flex-row px-5 bg-white  mt-10 bottom-0 '>
            <hr className='w-full left-0 right-0 absolute top-0'/>
            <div className='basis-1/3 flex flex-col gap-5'>
                <MersehSvg classname='w-[38px] h-[38px]' />
                <div className='flex flex-row gap-2'>

                    <span className='text-[14px] '>تلفن پشتیبانی:</span>
                    <span className='text-[14px]'>
                        <a href="tel:+4733378901" >021-26856389</a>
                    </span>
                </div>
                <p className='text-[14px]'>آدرس شعبه 1: تهران، میدان تجریش، خیابان دربندی، پلاک 118</p>
                <p className='text-[14px]'>آدرس شعبه 2: استان مرکزی، شهر محلات، خیابان شهید قندی، جنب امامزاده فضل و یحیی</p>
            </div>
            <div className='basis-1/3 flex flex-col'></div>
            <div className='basis-1/3 flex flex-col'>
               
            </div>

        </footer>
    )
}
