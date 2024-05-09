import React from 'react'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/image'
import image1 from '../../public/Images/small_bottle_oil.png'
import image2 from '../../public/Images/sunflower_oil.png'
import image3 from '../../public/Images/olive_oil.png'
import { Chevron_Down_sharp_light } from '../SVGS'
interface props {
    title: string;
    sliderStartDelay: number
}
const animation = { duration: 1000, easing: (t: any) => t }
export default function ProductCarousel({ title, sliderStartDelay }: props) {

    const [sliderRef, instanceRef] = useKeenSlider(
        {
            slideChanged() {
            },
            loop: true,
            slides: { perView: 5, spacing: 10 },
            renderMode: "precision",
            defaultAnimation:{},
            created(s) {
                setTimeout(() => {
                    s.moveToIdx(1, true, animation)
                }, sliderStartDelay)


            },
            updated(s) {
                setTimeout(() => { s.moveToIdx(s.track.details.abs + 1, true, animation) }, sliderStartDelay)
            },
            animationEnded(s) {
                setTimeout(() => { s.moveToIdx(s.track.details.abs + 1, true, animation) }, sliderStartDelay)
            }
        },
        [
            // add plugins here
        ]
    )

    return (
        <section className='w-full  flex flex-col items-center gap-5 '>
            <span className='text-[25px] text-black1 font-normal'>{title}</span>
            <div className='flex flex-row  h-[274px] w-full'>

                <div className='basis-1/12 h-full w-12 flex justify-center items-center '>
                    <Chevron_Down_sharp_light classname='rotate-[-90deg] w-6 fill-[#CCCCCC]' />
                </div>
                <div className='basis-10/12  keen-slider flex flex-row w-full ' ref={sliderRef}>


                    <div className="keen-slider__slide   h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>
                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>

                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>
                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>
                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>
                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>
                    <div className="keen-slider__slide  h-full flex justify-center">
                        <div className='border gap-2 flex flex-col items-center justify-center relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]'>

                            <Image className='rounded- w-full h-auto' style={{ objectFit: "contain" }} src={image1} alt='sdfg' quality={100} />
                            <span className='font-[500] text-[17px] text-black1'>روغن زیتون</span>
                            <span className='font-normal text-[16px] text-green1'>250,000 تومان</span>
                        </div>
                    </div>








                </div>
                <div className='basis-1/12 h-full w-12 flex justify-center items-center'>
                    <Chevron_Down_sharp_light classname='rotate-[90deg] w-6  fill-[#CCCCCC]' />
                </div>
            </div>
        </section>
    )
}
