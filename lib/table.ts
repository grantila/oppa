import { GroupTag, Table, TableRow, TableRows } from "./types"
import { arrayify } from "./util"
import { makeWidenRight, styledText, widenRight } from "./text"
import { gapLength, groupIndent } from "./constants"


export type GetExtraDescriptionRowsFunction = ( ) => Array< string >;

export interface FlatTableRowBase
{
	group?: GroupTag;
	isGroup?: boolean;
	getExtraDescriptionRows?: GetExtraDescriptionRowsFunction;
};

export interface FlatTableRowHeader extends FlatTableRowBase
{
	header: string;
}

export interface FlatTableRowNormal extends FlatTableRowBase
{
	key: string;
	desc: ReadonlyArray< string >;
}

export type FlatTableRow =
	| FlatTableRowHeader
	| FlatTableRowNormal;

export type PrintableRows = ReadonlyArray< FlatTableRow >;

export function flattenTable( table?: Table )
{
	const rows =
		!table
		? [ ] as TableRows
		: !Array.isArray( table )
		? [ < TableRow >table ] as TableRows
		: table as TableRows;

	return ( [ ] as FlatTableRow[ ] ).concat(
		...
		rows
		.map( obj =>
			Object.keys( obj )
			.map( key => ( { key, desc: arrayify( obj[ key ] ) } ) )
		)
	);
}

export function isFlatTableRowNormal(
	row: FlatTableRowNormal | FlatTableRowHeader
)
: row is FlatTableRowNormal
{
	return typeof ( row as FlatTableRowHeader ).header === 'undefined';
}

function getFirstWidth( rows: PrintableRows ): number
{
	return rows
		.filter( isFlatTableRowNormal )
		.map( row =>
			row.group
			? groupIndent + row.key.length
			: row.key.length
		)
		.sort( ( a, b ) => b - a )
		[ 0 ];
}

function getSecondWidth( rows: PrintableRows ): number
{
	const allRows = ( [ ] )
	return Math.max(
		...rows
			.filter( isFlatTableRowNormal )
			.map( row =>
				Math.max(
					...row.desc.map( line => line.length ),
					...( !row.getExtraDescriptionRows ? [ ] :
						row.getExtraDescriptionRows( )
						.map( line => line.length )
					)
				)
			)
	);
}

export function printTable( indent: number, rows: PrintableRows )
{
	const width = getFirstWidth( rows );
	const descWidth = width + gapLength + getSecondWidth( rows );

	const prefix = " ".repeat( indent );
	const groupPrefix = " ".repeat( groupIndent );
	const gap = " ".repeat( gapLength );

	const widenLine = makeWidenRight( descWidth );

	const ret: Array< Array< string > > =
		rows.map( ( row ): Array< string > =>
		{
			if ( !isFlatTableRowNormal( row ) )
			{
				return [ row.header ];
			}

			const { key, desc, group, isGroup, getExtraDescriptionRows } = row;
			const retLines: Array< string > = [ ];
			if ( isGroup )
			{
				retLines.push(
					prefix +
					styledText( group,
						widenLine(
							widenRight( group.name, width ) +
							gap
						)
					)
				);
			}
			else
			{
				const [ first, ...rest ] = desc;

				retLines.push(
					prefix +
					styledText( group,
						widenLine(
							( group ? groupPrefix : '' ) +
							widenRight(
								key,
								width - ( group ? groupIndent : 0 )
							) +
							gap +
							first
						)
					)
				);
				retLines.push(
					...rest.map( text =>
						prefix +
						styledText( group,
							widenLine(
								widenRight( '', width ) +
								gap +
								text
							)
						)
					)
				);

				if ( getExtraDescriptionRows )
					retLines.push(
						...getExtraDescriptionRows( )
						.map( line =>
							prefix +
							styledText( group,
								widenLine(
									widenRight( '', width ) +
									gap +
									line
								)
							)
						)
					);
			}
			return retLines;
		} );
	return ( [ ] as typeof ret[ number ] ).concat( ...ret );
}
