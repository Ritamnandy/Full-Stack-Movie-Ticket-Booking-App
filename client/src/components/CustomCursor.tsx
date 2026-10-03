import { useEffect, useRef } from "react";

const INTERACTIVE =
    "a, button, [role='button'], input, textarea, select, label, summary, .cursor-pointer";

export default function CustomCursor ()
{
    const outlineRef = useRef<HTMLDivElement>( null );
    const outlineInnerRef = useRef<HTMLDivElement>( null );
    const dotRef = useRef<HTMLDivElement>( null );
    const dotInnerRef = useRef<HTMLDivElement>( null );

    useEffect( () =>
    {
        // Only on devices with a real mouse (skips phones and tablets)
        if ( !window.matchMedia( "(hover: hover) and (pointer: fine)" ).matches ) return;

        const outline = outlineRef.current;
        const outlineInner = outlineInnerRef.current;
        const dot = dotRef.current;
        const dotInner = dotInnerRef.current;
        if ( !outline || !outlineInner || !dot || !dotInner ) return;

        const mouse = { x: 0, y: 0 };
        const outlinePos = { x: 0, y: 0 };
        const dotPos = { x: 0, y: 0 };
        let initialized = false;
        let frame = 0;

        const setVisible = ( visible: boolean ) =>
        {
            const value = visible ? "1" : "0";
            outline.style.opacity = value;
            dot.style.opacity = value;
        };

        const setAttr = ( name: string, value: boolean ) =>
        {
            outlineInner.setAttribute( name, String( value ) );
            dotInner.setAttribute( name, String( value ) );
        };

        const onMove = ( e: MouseEvent ) =>
        {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Start at the real mouse position so it doesn't fly in from the corner
            if ( !initialized )
            {
                outlinePos.x = dotPos.x = e.clientX;
                outlinePos.y = dotPos.y = e.clientY;
                initialized = true;
            }
            setVisible( true );
        };

        const onOver = ( e: MouseEvent ) =>
        {
            const target = e.target as Element | null;
            setAttr( "data-hover", !!target?.closest?.( INTERACTIVE ) );
        };

        const onDown = () => setAttr( "data-down", true );
        const onUp = () => setAttr( "data-down", false );
        const onEnter = () => setVisible( true );
        const onLeave = () => setVisible( false );

        const animate = () =>
        {
            // Dot follows quickly, ring trails behind
            dotPos.x += ( mouse.x - dotPos.x ) * 0.35;
            dotPos.y += ( mouse.y - dotPos.y ) * 0.35;
            outlinePos.x += ( mouse.x - outlinePos.x ) * 0.15;
            outlinePos.y += ( mouse.y - outlinePos.y ) * 0.15;

            dot.style.transform = `translate3d(${ dotPos.x - 6 }px, ${ dotPos.y - 6 }px, 0)`;
            outline.style.transform = `translate3d(${ outlinePos.x - 20 }px, ${ outlinePos.y - 20 }px, 0)`;

            frame = requestAnimationFrame( animate );
        };
        frame = requestAnimationFrame( animate );

        window.addEventListener( "mousemove", onMove );
        window.addEventListener( "mouseover", onOver );
        window.addEventListener( "mousedown", onDown );
        window.addEventListener( "mouseup", onUp );
        window.addEventListener( "blur", onLeave );
        document.documentElement.addEventListener( "mouseenter", onEnter );
        document.documentElement.addEventListener( "mouseleave", onLeave );

        return () =>
        {
            cancelAnimationFrame( frame );
            window.removeEventListener( "mousemove", onMove );
            window.removeEventListener( "mouseover", onOver );
            window.removeEventListener( "mousedown", onDown );
            window.removeEventListener( "mouseup", onUp );
            window.removeEventListener( "blur", onLeave );
            document.documentElement.removeEventListener( "mouseenter", onEnter );
            document.documentElement.removeEventListener( "mouseleave", onLeave );
        };
    }, [] );

    return (
        <>
            {/* Ring: outer div handles position, inner div handles scale and color */ }
            <div
                ref={ outlineRef }
                aria-hidden="true"
                className="fixed top-0 left-0 z-9999 pointer-events-none opacity-0 transition-opacity duration-300"
            >
                <div
                    ref={ outlineInnerRef }
                    className="h-10 w-10 rounded-full border border-primary transition-all duration-200 ease-out
                               data-[hover=true]:scale-[1.6] data-[hover=true]:bg-primary/10
                               data-[down=true]:scale-75"
                />
            </div>

            {/* Dot */ }
            <div
                ref={ dotRef }
                aria-hidden="true"
                className="fixed top-0 left-0 z-9999 pointer-events-none opacity-0 transition-opacity duration-300"
            >
                <div
                    ref={ dotInnerRef }
                    className="h-3 w-3 rounded-full bg-primary transition-transform duration-200 ease-out
                               data-[hover=true]:scale-0 data-[down=true]:scale-150"
                />
            </div>
        </>
    );
}