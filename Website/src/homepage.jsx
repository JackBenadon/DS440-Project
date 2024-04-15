import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/total_table_two_df.csv')
      .then(response => response.text())
      .then(csvData => Papa.parse(csvData, {
        header: true,
        complete: results => {
          setPlayers(results.data);
        }
      }));
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      const filteredPlayers = players.filter(player => regex.test(player.Name));
      const uniqueNames = new Set();
      const uniquePlayers = [];

      filteredPlayers.forEach(player => {
        if (!uniqueNames.has(player.Name)) {
          uniqueNames.add(player.Name);
          uniquePlayers.push(player);
        }
      });

      setSuggestions(uniquePlayers);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setSuggestions([]);
    navigate(`/player?name=${encodeURIComponent(name)}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/player?name=${encodeURIComponent(searchTerm)}`);
  };

  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Player Search</h1>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for a player"
          autoComplete="off"
          style={{ padding: '10px', width: '300px', marginRight: '10px' }} // marginRight added to create space between the input and the button
        />
        <button type="submit" onClick={handleSearchSubmit} style={{ padding: '10px 20px' }}>Search</button>
      </div>
      {suggestions.length > 0 && (
        <ul style={{
          listStyleType: 'none',
          padding: 0,
          margin: '10px 0 0', // margin-top added to position the suggestions below the input and button
          background: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          position: 'absolute',
          width: '300px', // Match the input's width
          zIndex: 1000
        }}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion.Name)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #ccc'
                }}>
              {suggestion.Name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomePage;