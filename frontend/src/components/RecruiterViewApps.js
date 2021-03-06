import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Box from '@material-ui/core/Box';
import axios from "axios";
import DropdownButton from 'react-bootstrap/DropdownButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import moment from 'moment'
import Form from 'react-bootstrap/Form'


import RecruiterJobs from './RecruiterJobs'

export default class RecruiterViewApps extends Component {

    state = {
        email : "",
        job_id : "",
        apps : [],
        sort: "username",
        order: "ascending"
    }

    componentDidMount(){

        const newObj = {
            email: localStorage.getItem("email"),
            type: localStorage.getItem("type"),
            job_id: localStorage.getItem("job_id"),
        };
        if (newObj.type !== "Recruiter") this.props.history.push("/");
        this.setState({ email: newObj.email });

        axios
        .post("http://localhost:5000/recruiter/viewApps",newObj)
        .then(response => {
            this.setState({ apps: response.data });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    goBack = ()=>{
        localStorage.setItem("job_id",'')
        console.log(localStorage.getItem("job_id"))
        this.props.history.push("/ActiveJobs");

    }
    checkButtonType = (app)=>{
        //3 types : apply , full , applied

        //1.check if applied:
        if(app.status === 'Shortlisted')return "Shortlisted"
        if(app.status === 'Applied')return "Applied"
        if(app.status === 'Accepted')return "Accepted"

    }

    shortlist = (idx)=>()=>{

        axios
        .post("http://localhost:5000/application/shortlist",this.state.apps[idx])
        .then(response => {
           const copy = [...this.state.apps]
           copy[idx].status= 'Shortlisted'
           this.setState({apps : copy})
           alert("Application has been shortlisted for further rounds")
        })
        .catch(function (error) {
            console.log(error);
        });

    }

    accept = (idx)=>()=>{
        const copy = [...this.state.apps]
           copy[idx].status= 'Accepted'
           copy[idx].join = new Date()
           this.setState({apps : copy})

        console.log("GIVEN ACCEPT APP DATA..",this.state.apps[idx])
        
        axios
        .post("http://localhost:5000/application/accept",this.state.apps[idx])
        .then(response => {
           console.log(response.data)
           alert("Application has been accepted!!")
           if(response.data == "1"){

               alert("All Positions have been filled!! Job is now Inactive")

               const newObj = {job_id: localStorage.getItem("job_id"),email : copy[idx].email_applicant};
               axios
                .post("http://localhost:5000/recruiter/viewApps",newObj)
                .then(response => {
                    this.setState({ apps: response.data });
                })
                .catch(function (error) {
                    console.log(error);
                });
           }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    reject = (idx)=>()=>{

        axios
        .post("http://localhost:5000/application/reject",this.state.apps[idx])
        .then(response => {
            alert("Application has been Rejected")
            const copy = [...this.state.apps]
            copy[idx].status= 'Rejected'
            copy.splice(idx, 1)
            this.setState({apps : copy})
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    sort = e => {

        const copy = this.state.apps

        if (this.state.order === "ascending") {
            switch (this.state.sort) {
                case "rating":
                    copy.sort((a, b) => (a.rate > b.rate) ? 1 : -1);
                    
                    break;
                case "date":
                    copy.sort((a, b) => (a.date > b.date) ? 1 : -1);
                    break;
                case "username":
                    copy.sort((a, b) => (a.username > b.username) ? 1 : -1);
                    console.log("heyyy")
                    break;
            }
        }
        else if (this.state.order === "descending") {
            switch (this.state.sort) {
                case "username":
                    copy.sort((a, b) => (a.username > b.username) ? -1 : 1);
                    console.log("heyyy")
                    break;
                case "date":
                    copy.sort((a, b) => (a.date > b.date) ? -1 : 1);
                    break;
                case "rating":
                    copy.sort((a, b) => (a.rate > b.rate) ? -1 : 1);
                    break;
            }
        }

        this.setState({ apps: copy })
    }

    sortChange = e => {
        console.log("value is for sort", e.target.value)

        this.setState({ sort: e.target.value })
        console.log(this.state.sort)

    }

    orderChange = e => {
        console.log("value is for order", e.target.value)

        this.setState({ order: e.target.value })
        console.log(this.state.order)
    }





    render(){
        return(
            <div>
                <Button variant="success" size="lg" onClick={this.goBack}>GO BACK TO JOB LISTINGS</Button>

                <br></br><br></br> <br></br> 

                <Form inline>
                    <Form.Control as="select" className="mr-sm-2" defaultValue={this.state.sort} onClick={this.sortChange}>
                        <option value="username">Applicant Name</option>
                        <option value="date">Date of Application</option>
                        <option value="rating">Applicant Rating</option>
                    </Form.Control>
                    <Form.Control as="select" className="mr-sm-2" defaultValue={this.state.order} onClick={this.orderChange} >
                        <option value="ascending">ascending</option>
                        <option value="descending">descending</option>
                    </Form.Control>
                    <Button style={{ marginRight: 15 }} onClick={this.sort} variant="outline-info">Sort</Button>
                </Form>
                 <br></br><br></br><br></br>   
                <Table striped bordered hover  responsive="lg">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Submitted Date</th>
                        <th>STATEMENT OF PURPOSE</th>
                        <th >Education</th>
                        <th>Skills</th>
                        <th>Applicant Rating</th>
                        <th>Status</th>
                        <th>Shortlist/Accept</th>
                        <th>Reject</th>
                    </tr>

                   
                </thead>
               
                <tbody>
                
                    {this.state.apps.map((app,idx) =>{
                        const select = this.checkButtonType(app)
                        
                        var mx= 0
                        if(this.state.apps[idx].education.length >this.state.apps[idx].skills.length )mx = this.state.apps[idx].education.length
                        else mx= this.state.apps[idx].skills.length
                        if(!mx)mx= 1

                        var skills = this.state.apps[idx].skills.toString()
                        console.log(mx)
                        
                        return(
                            <tr>
                            <td >{this.state.apps[idx].username}</td>
                            <td >{moment(this.state.apps[idx].date).format("DD/MM/YY")}</td>
                            <td>{this.state.apps[idx].sop}</td>
                            
                            {this.state.apps[idx].education.length!==0 && 
                            this.state.apps[idx].education.map((edu,idx) =>{
                                return(
                                    <div>
                                    <td><b>Institute</b><br/>{edu.institute}</td>
                                    <td><b>StartYear</b><br/>{edu.startyear}</td>
                                    <td><b>End Year</b><br/>{edu.endyear}</td>
                                    </div>
                                )
                            })}
                            {this.state.apps[idx].education.length=== 0 &&<td>Not Filled</td> }
                            <td>{skills===''? "Not Filled": skills}</td>
                            

                            <td>{this.state.apps[idx].rate}</td>
                            
                            {select === 'Applied' && <td ><Button variant="outline-primary" value="edit">Applied</Button></td> }
                            {select === 'Shortlisted' && <td ><Button variant="outline-warning" value="edit">Shortlisted</Button></td> }
                            {select === 'Accepted' && <td ><Button variant="outline-success" value="edit">Accepted</Button></td> }


                            {select === 'Applied' &&  <td ><Button variant="warning" className="btn btn-primary" value="edit" onClick={this.shortlist(idx)}>Shortlist</Button></td>}
                            {select === 'Shortlisted' &&  <td ><Button variant="success" className="btn btn-primary" value="edit" onClick={this.accept(idx)}>Accept</Button></td>}
                            
                            {select !== 'Accepted' && <td ><Button variant="danger" className="btn btn-primary" value="edit" onClick={this.reject(idx)}>Reject</Button></td>}
                            </tr>
                        )})}
                </tbody>
                </Table>           

            </div>
        )
    }
}