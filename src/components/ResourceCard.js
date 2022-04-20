import React from 'react'
import { Card, Button } from 'react-bootstrap';
import {useAuth} from "../AuthContext"
import {useNavigate} from "react-router-dom"

import { Link } from 'react-router-dom';

export default function ResourceCard(resource) {
    const {currentUser} = useAuth();
    const navigate = useNavigate();

    function navigateToEditResource() {
        // navigate("/edit-resource");
        navigate(
            '/edit-resource',
            {
              state: {
               source: resource
              }
            }
          );
    }

    let title = resource.title;
    let desc = resource.desc;
    let id = resource.id;


    return (
        <Card>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{desc}</Card.Text>
                

                <Button variant="link" onClick={() => navigate(`/Resource/${id}`)} key={id}>
                    View 
                </Button>
                {currentUser && (
                        <Button variant="link" onClick={navigateToEditResource}>Edit</Button>     
                    ) 
                }
            </Card.Body>
        </Card>
    )
}
