import React from "react";

export default class NewQuoteForm extends React.Component
{
    handleAuthorChange( e )
    {
        if ( this.props.changeAuthor )
        {
            this.props.changeAuthor( e.target.value );
        }
        else
        {
            console.log( "changeAuthor props function undefined" );
        }
    }

    handleBodyChange( e )
    {
        if ( this.props.changeBody )
        {
            this.props.changeBody( e.target.value );
        }
        else
        {
            console.log( "changeBody props function undefined" );
        }
    }

    render()
    {
        return ( 
            <form action='/newQuote' method='post'>
                <input size='41' type='text' name='author' placeholder='Author' 
                    className="form-control" onChange={this.handleAuthorChange.bind( this )} maxlength="100" required/>
                <br />
                <textarea rows='8' cols='40' name='body' placeholder='Text' 
                    className="form-control" onChange={this.handleBodyChange.bind( this )} maxlength="3000" required></textarea>
            </form>
        );
    }
}
