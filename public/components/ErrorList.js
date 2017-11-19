import React from "react";

export default class ErrorList extends React.Component
{
    render()
    {
        console.log( this.props.errors );
        var errorElems = [];
        for ( var i = 0; i < this.props.errors.length; i++ )
        {
            console.log( "PUSH " + i );
            errorElems.push( 
                <div key={i} > {this.props.errors[ i ].name + ":" + this.props.errors[ i ].problem} </div>
            );
        }

        if ( errorElems.length > 0 )
        {
            return (
                <div className='alert-danger'>
                    {errorElems}
                </div>
            );
        }

        return ( <div></div> );
    }
}
