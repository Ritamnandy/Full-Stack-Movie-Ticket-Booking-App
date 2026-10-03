
type Props = {
    text1: string
    text2: string
}

export default function AdminTitle ( { text1, text2 }: Props )
{
    return (
        <h1 className="font-medium text-2xl">
            { text1 } <span className="underline text-primary">{ text2 }</span>
        </h1>
    )
}
