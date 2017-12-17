import React from "react";
import BaseModal from "./BaseModal";
import NewQuoteForm from "./NewQuoteForm";
import InputModal from "./InputModal";

export default class NewQuoteModal extends InputModal
{
    constructor( props )
    {
        super( props );
        this.inputData.author = "";
        this.inputData.body = "";
    }

    render()
    {
        return (
            <BaseModal modalTitle='New Quote' 
                modalBody={<NewQuoteForm onFieldChange={this.updateField.bind( this )} />}
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

            if ( self.props.onAddQuote )
            {
                self.props.clearModal();
                self.props.onAddQuote( data );
            }
        });
    }
}
