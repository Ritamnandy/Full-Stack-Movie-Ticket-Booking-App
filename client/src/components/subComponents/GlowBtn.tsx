
type Props = {
    title: string
    onClick: () => void
}

function GlowBtn ( { title, onClick }: Props )
{
    return (
        <>
            <style>{ `
                @keyframes rotate {
                    0% {
                        transform: rotate(70deg);
                    }
            
                    50% {
                        transform: rotate(100deg);
                    }
            
                    100% {
                        transform: rotate(70deg);
                    }
                }
            
                .rainbow::before {
                    content: '';
                    position: absolute;
                    z-index: -2;
                    left: -50%;
                    top: -50%;
                    width: 200%;
                    height: 200%;
                    background-position: 100% 50%;
                    background-repeat: no-repeat;
                    background-size: 50% 30%;
                    filter: blur(6px);
                    background-image: linear-gradient(#FFF);
                    animation: rotate 4s ease-in-out infinite;
                }
            `}</style>
            <div className="rainbow relative z-0 bg-transparent overflow-hidden p-0.5 flex items-center justify-center rounded-lg hover:scale-105 transition duration-300 active:scale-100">
                <button className="px-8 text-sm py-3 text-white rounded-md font-medium bg-primary backdrop-blur cursor-pointer" onClick={onClick}>
                    { title }
                </button>
            </div>
        </>
    );

}

export default GlowBtn