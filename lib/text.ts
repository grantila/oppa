import * as chalk from "chalk"

import { Style } from "./types"


export function chalked( style?: Style | undefined )
{
	if ( !style )
		return ( ...text: Array< string > ) => text.join( ' ' );

	let clr = chalk.reset;
	if ( style.color )
	{
		if ( style.color.startsWith( '#' ) )
			clr = clr.hex( style.color );
		else
			clr = clr.keyword( style.color );
	}
	if ( style.backgroundColor )
	{
		if ( style.backgroundColor.startsWith( '#' ) )
			clr = clr.bgHex( style.backgroundColor );
		else
			clr = clr.bgKeyword( style.backgroundColor );
	}
	return clr;
}

export const styledText = ( style: Style | undefined, text: string ) =>
	chalked( style )( text );

export const widenRight = ( text: string, width: number ) =>
	text + ' '.repeat( width - text.length );

export const makeWidenRight = ( width: number ) => ( text: string ) =>
	text + ' '.repeat( width - text.length );
