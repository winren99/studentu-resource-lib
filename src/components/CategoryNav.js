import React from 'react'
import { Nav } from 'react-bootstrap'

export default function CategoryNav() {
  return (
    <Nav
    activeKey="/all"
    onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
    className="justify-content-center"
    >
        <Nav.Item>
            <Nav.Link href="/all">All</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-1">Academic Resources</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Community Resources</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Durham Public Schools</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Health</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Latinx Resources</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Online Platforms</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="link-2">Social/Emotional Support</Nav.Link>
        </Nav.Item>
    </Nav>
  )
}