const splitNumber : Function = (input: any) => {
    const prepareNumber = String(input).split(',').join('')
    const newInput = prepareNumber.split('').reverse()
    const result: string[]  = newInput.map((e : string, index:number) => {
        if(((index + 1) % 3 === 0) && newInput[index + 1]) {
            return `,${e}`
        }
        return e
    })
    return result.reverse().join('')
}

export default splitNumber