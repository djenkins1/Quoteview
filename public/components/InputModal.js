import React from "react";

export default class InputModal extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { "errors" : [] };
        this.inputData = { };
    }

    render()
    {
        throw new Error( "render(): not implemented by InputModal,needs to be implemented by child class" );
    }

    updateField( fieldName, fieldValue )
    {
        this.inputData[ fieldName ] = fieldValue;
    }
}
