import React from "react";
import BaseModal from "./BaseModal";
import NewQuoteForm from "./NewQuoteForm";

export default class NewQuoteModal extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { "errors" : [] };
        this.inputData = {"author" : "" , "body" : "" };
    }

    updateAuthorField( newAuthor )
    {
        this.inputData.author = newAuthor;
    }

    updateBodyField( newBody )
    {
        this.inputData.body = newBody;
    }

    render()
    {
        return (
            <BaseModal modalTitle='New Quote' 
                modalBody={<NewQuoteForm changeAuthor={this.updateAuthorField.bind(this)} 
                    changeBody={this.updateBodyField.bind( this )} />}
                yesText='Create' noText='Cancel' 
                yesFunc={this.submitQuote.bind( this )} 
                noFunc={this.props.clearModal} errors={this.state.errors}/>
        );
    }

    submitQuote( reactDomModal )
    {
        var self = this;
        $.post( "/newQuote" , self.inputData , function( data, status )
        {
            if ( data.error || data.errors )
            {
                console.log( "ERROR:" + data.error );
                self.setState( { "errors" : data.errors } );
                return;
            }

            if ( data.qid == undefined )
            {
                console.log( "SERVER DID NOT CREATE QUOTE" )
                var myErrors = [ { "name" : "Quote" , "problem" : "Did not create quote, please try again." } ];
                self.setState( { "errors" : myErrors } );
                return;
            }       

            self.props.clearModal();     
            //TODO: need to add new quote to list of quotes somehow?
        });
    }
}
