import React from "react";

export default class InputForm extends React.Component
{
    render()
    {
        throw new Error( "render(): not implemented by InputForm,needs to be implemented by child class" );
    }

    updateField( fieldName, fieldValue )
    {
        this.inputData[ fieldName ] = fieldValue;
    }

    handleFieldChange( e )
    {
        this.props.onFieldChange( e.target.name, e.target.value );
    }

    handleEnterPress( e )
    {
        if ( e.which == 13 || e.keyCode == 13 )
        {
            this.props.submitFunc( undefined );
        }
    }
}
