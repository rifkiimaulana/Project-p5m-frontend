import React from "react";
import Menu from "./Menu";

const styles = {
  sidebar: {
    borderRight: '1px solid #ddd',
    position: 'fixed',
    height: '100%',
    paddingTop: '1rem',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
    width: '250px',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    transition: 'width 0.3s',
  },
  menuLink: {
    display: 'block',
    padding: '0.75rem 1.25rem',
    color: '#333',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
  },
  menuLinkHover: {
    backgroundColor: '#007bff',
    color: '#fff',
  }
};

export default function SideBar({ listMenu }) {
  return (
    <div style={styles.sidebar} className="sidebarMenu">
      <Menu listMenu={listMenu} />
    </div>
  );
}
