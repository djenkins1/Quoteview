import React from "react";
import InputForm from "./InputForm";

export default class NewQuoteForm extends InputForm
{
    render()
    {
        return ( 
            <form action='/newQuote' method='post'>
                <input size='41' type='text' name='author' placeholder='Author' 
                    className="form-control" 
                    onChange={this.handleFieldChange.bind(this)} 
                    maxlength="100" required />
                <br />
                <textarea rows='8' cols='40' name='body' placeholder='Text' 
                    className="form-control" maxlength="3000" 
                    onChange={this.handleFieldChange.bind(this)}  required ></textarea>
            </form>
        );
    }
}
