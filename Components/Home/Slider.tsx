import React, { useEffect, useState } from 'react'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/image'
import image1 from '../../public/Images/1713267092.webp'
import image2 from '../../public/Images/1713706832.webp'
import image3 from '../../public/Images/1713952254.webp'

export default function Slider() {
    const [sliderControl, setSliderControl] = useState<number>()
    const [sliderControl1, setSliderControl1] = useState<number>()


    const [sliderRef, instanceRef] = useKeenSlider(

        {
            slideChanged(s) {
                setSliderControl(s.track.details.abs + 1)
            },
            slides: { perView: 1 },
            loop: true,
            mode: "snap",
            renderMode: "precision",
            defaultAnimation: { easing: (t: any) => (t), duration: 1500 },

            created(s) {
                setTimeout(() => {
                    s.moveToIdx(1, true)
                }, 2000)
            }

        },
        [
            // add plugins here
        ]
    )

    useEffect(() => {
        let timeOut = setTimeout(() => {
            instanceRef.current?.moveToIdx(instanceRef.current?.track.details.abs + 1, true)

        }, 6000)
        return () => { clearTimeout(timeOut) }
    }, [sliderControl])



    const [sliderRef1, instanceRef1] = useKeenSlider(
        {
            slideChanged(s) {
                setSliderControl1(s.track.details.abs + 1)

            },
            slides: { perView: 1 },
            loop: true,
            mode: "snap",
            renderMode: "precision",
            defaultAnimation: { easing: (t: any) => (t), duration: 1000 },

            created(s) {
                setTimeout(() => {
                    s.moveToIdx(1, true)
                }, 6000)


            },


        },
        [
            // add plugins here
        ]
    )

    useEffect(() => {
        let timeOut = setTimeout(() => {
            instanceRef1.current?.moveToIdx(instanceRef1.current?.track.details.abs + 1, true)

        }, 6000)
        return () => { clearTimeout(timeOut) }
    }, [sliderControl1])
    return (
        <section className='flex flex-row gap-10 w-full h-fit p-6 pl-10 items-center justify-evenly'>
            <div className='basis-2/3 h-full keen-slider rounded-[10px]' ref={sliderRef}>

                <div className="keen-slider__slide bg-black">
                    <Image src={image3} alt='' />
                </div>
                <div className="keen-slider__slide bg-red-700">
                    <Image src={image2} alt='' />
                </div>
            </div>

            <div className='basis-1/3 h-full keen-slider rounded-[10px] ' ref={sliderRef1}>

                <div className="keen-slider__slide bg-black w-full"><Image src={image1} alt='' style={{ objectFit: "contain" }} /></div>
                <div className="keen-slider__slide bg-red-700">2</div>
            </div>

        </section>
    )
}
