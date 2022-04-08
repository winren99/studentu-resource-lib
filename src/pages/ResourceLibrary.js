import React, { useState, useEffect, Fragment } from "react";
import GetFirebase from '../GetFirebase'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useAuth} from "../AuthContext"
import {useNavigate} from "react-router-dom"
import SignOut from "../SignOut"
import {getResources} from "../firebase"
import firebase from "../firebase";
import ResourceCard from "../components/ResourceCard";
import { Container, Nav, NavItem, Row, Navbar, NavDropdown, Button, Col, Stack, Form } from 'react-bootstrap';
import CategoryNav from "../components/CategoryNav";
import TagNav from "../components/TagNav";
import SearchBar from "../components/SearchBar"
import AddResource from "../components/AddResourceButton"
import {ReactComponent as ArrowDown} from '../assets/arrow-down.svg'

export default function ResourceLibrary() {
  const {currentUser} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [tags, setTags] = useState([]);

  const ref = firebase.firestore();
  const [selectedTags, setSelectedTags] = useState([]);

  function navigateToSignIn() {
    navigate("/login");
  }

  function getResources() {
    setLoading(true);
    const resourcesRef = ref.collection("resources")
    resourcesRef.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setResources(items);
      setLoading(false);
    });
  }

  function getTags() {
    const tagsRef = ref.collection("tags")
    tagsRef.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setTags(items);
    });
  }

  function selectTag(e) {
    const tag = e.target.innerHTML;   
    const index = selectedTags.indexOf(tag);
    if (index !== -1) {
      setSelectedTags(selectedTags.filter((e) => e !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  function removeTag(e) {
    const tag = e.target.id; 
    console.log(e.target.id)  
    const index = selectedTags.indexOf(tag);
    if (index !== -1) {
      setSelectedTags(selectedTags.filter((e) => e !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  useEffect(() => {
    getResources();
    getTags();

  }, []);
  
  
  return ( 
    <Container fluid={true}>
        <Stack className="resource-library-header" direction="horizontal" gap={3}>
            <h1 className="resource-library-title me-auto">Resource Library</h1>
            {currentUser ? (
            <>
            <p>Admin Mode</p>
            <SignOut />
            </>
            ) : 
                <Button onClick={navigateToSignIn}>
                Admin Login
                </Button>
            }
        </Stack>
       
        <CategoryNav />
        <Container fluid={true}>
            <Row>
                <Col className="tag-nav-container" lg={2}>
                  <Navbar className="flex-column sidebar" expand="lg">
                    <Navbar.Brand className="filters-brand">Filters</Navbar.Brand>
                    <Navbar.Toggle aria-controls="filter-sidebar-nav"><div className="arrow-down"><ArrowDown /></div></Navbar.Toggle>
                    <Navbar.Collapse id="filter-sidebar-nav">
                    <Nav className="bg-light flex-column sidebar">
                        {tags.map((tag) => {
                          if (selectedTags.includes(tag.name)) {
                            return (
                              <Nav.Item className="sidebar-item">
                                <Nav.Link className="sidebar-link active-link" onClick={selectTag}>{tag.name}</Nav.Link>
                              </Nav.Item>
                            )
                          } else {
                            return (
                              <Nav.Item className="sidebar-item">
                                <Nav.Link className="sidebar-link" onClick={selectTag}>{tag.name}</Nav.Link>
                              </Nav.Item>
                            )
                          }
                        })}
                    </Nav>
                    </Navbar.Collapse>
                  </Navbar>
                </Col>
                <Col>
                    <div className="search-bar-container">
                      <SearchBar />
                      {currentUser && 
                      <AddResource />
                      }
                      
                      
                     
                    </div>
                    <div className="tags-container">
                    {selectedTags.map((tag) => {
                        return (
                        <div onClick={removeTag} id={tag} className="tag-pill" key={tag}>{tag}<img id={tag} className="x" src={require('../assets/x.png')}></img></div>
                        )
                      })}
                    </div>
                    
                    <Container className="resources-container">
                        {loading ? <p>Loading...</p> : null}
                        <Row>
                        {resources.map((resource) => (
                            <Col lg={3} md={6} sm={12}>
                            <ResourceCard {...resource} key={resource.title} />
                            </Col>
                        ))}
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    </Container>   
      
    
  )
}
