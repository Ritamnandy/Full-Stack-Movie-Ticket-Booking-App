
type Props = {
    topValue?: string
    leftValue?: string
    rightValue?: string
    bottomValue?: string
}



const BlurCircle = ({topValue='auto', leftValue='auto', rightValue='auto', bottomValue='auto'}:Props) =>
{
    return (
        <div className="absolute -z-50 h-58 w-58 aspect-square rounded-full bg-primary/30 blur-3xl"
            style={{ top: topValue, left: leftValue, right: rightValue, bottom: bottomValue }}
        >

        </div>
    )
}

export default BlurCircle