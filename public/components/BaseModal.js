import React from "react";
import ReactDOM from "react-dom";
import ErrorList from "./ErrorList";

export default class BaseModal extends React.Component
{
    render()
    {
        return (
            <div className="modal">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title"> {this.props.modalTitle} </h5>
                            <button type="button" onClick={this.noButtonClick.bind( this )} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body"> 
                            {this.props.modalBody} 
                            <ErrorList errors={this.props.errors} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={this.yesButtonClick.bind( this )} > {this.props.yesText} </button>
                            <button type="button" className="btn btn-secondary closeModalBtn" onClick={this.noButtonClick.bind( this )} 
                                data-dismiss="modal"> {this.props.noText} </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount()
    {
        var self = ReactDOM.findDOMNode(this);
        $( self ).modal();
    }

    componentWillUnmount()
    {
        var self = ReactDOM.findDOMNode(this);
        $( ".closeModalBtn" ).click();
    }

    yesButtonClick( e )
    {
        e.preventDefault();
        var self = this;
        this.props.yesFunc( self );
    }

    noButtonClick( e )
    {
        e.preventDefault();
        var self = this;
        this.props.noFunc( self );
    }
}


