import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const marketValueColors = [
    'rgb(75, 192, 192)', 'rgb(34, 139, 34)', 'rgb(153, 50, 204)',
    'rgb(255, 140, 0)', 'rgb(70, 130, 180)', 'rgb(255, 99, 132)',
    'rgb(255, 159, 64)', 'rgb(54, 162, 235)', 'rgb(104, 132, 245)',
    'rgb(153, 102, 255)'
];
const predictionDotColors = [
  'rgb(75, 192, 192)', 'rgb(34, 139, 34)', 'rgb(153, 50, 204)',
  'rgb(255, 140, 0)', 'rgb(70, 130, 180)', 'rgb(255, 99, 132)',
  'rgb(255, 159, 64)', 'rgb(54, 162, 235)', 'rgb(104, 132, 245)',
  'rgb(153, 102, 255)'
];

const seasonOrder = ["2019/2020", "2020/2021", "2021/2022", "2022/2023", "2023/2024"];

const PlayerDetailsPage = () => {
    const [chartData, setChartData] = useState({ datasets: [] });
    const [playerDetails, setPlayerDetails] = useState([]);
    const [isComparing, setIsComparing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const playerName = new URLSearchParams(location.search).get('name');
        if (playerName) {
            fetchData(playerName);
        }
    }, [location.search]);

    useEffect(() => {
        if (searchTerm) {
            const timeoutId = setTimeout(() => {
                fetchSuggestions(searchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);

    const fetchSuggestions = async (search) => {
        const response = await fetch('/total_table_two_df.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, { header: true }).data;

        const uniquePlayers = new Map();
        parsedData.forEach(player => {
            if (player.Name && player.Name.toLowerCase().includes(search.toLowerCase())) {
                if (!uniquePlayers.has(player.Name.toLowerCase())) {
                    uniquePlayers.set(player.Name.toLowerCase(), player);
                }
            }
        });

        setSuggestions(Array.from(uniquePlayers.values()).slice(0, 5));
    };

    const fetchData = async (playerName, addComparison = false) => {
        const responseTotal = await fetch('/total_table_two_df.csv');
        const csvDataTotal = await responseTotal.text();
        const parsedTotal = Papa.parse(csvDataTotal, { header: true }).data;

        const responseMerged = await fetch('/merged_table.csv');
        const csvDataMerged = await responseMerged.text();
        const parsedMerged = Papa.parse(csvDataMerged, { header: true }).data;

        const playerRecords = parsedTotal.filter(player => 
            player.Name?.toLowerCase() === playerName.toLowerCase()
        );

        const mostRecentRecord = playerRecords.sort((a, b) => b.Season.localeCompare(a.Season))[0];

        if (!addComparison) {
            setPlayerDetails([mostRecentRecord]);  // Set only the most recent season
        } else {
            const existingNames = new Set(playerDetails.map(pd => pd.Name.toLowerCase()));
            const newRecords = [mostRecentRecord];
            setPlayerDetails([...playerDetails, ...newRecords]);
        }

        updateChartData(parsedTotal, parsedMerged, playerName);
    };

    const updateChartData = (totalData, mergedData, playerName) => {
        const playerMarketValues = totalData.filter(player => 
            player.Name?.toLowerCase() === playerName.toLowerCase()
        ).map(player => ({
            x: player.Season,
            y: player.market_value_in_eur
        }));

        const playerPredictions = mergedData.filter(p => 
            p.Name?.toLowerCase() === playerName.toLowerCase()
        ).map(p => ({
            x: p.Season,
            y: parseFloat(p.predictions)
        }));

        const datasets = [{
            label: `${playerName} - Market Value`,
            data: playerMarketValues,
            borderColor: marketValueColors[playerDetails.length % marketValueColors.length],
            fill: false,
        }, {
            label: `${playerName} - Predictions`,
            data: playerPredictions,
            backgroundColor: predictionDotColors[playerDetails.length % predictionDotColors.length],
            borderColor: predictionDotColors[playerDetails.length % predictionDotColors.length],
            pointRadius: 10,
            pointHoverRadius: 15,
            showLine: false
        }];

        setChartData({
            labels: seasonOrder,
            datasets: [...chartData.datasets, ...datasets]
        });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSuggestionClick = (name) => {
        fetchData(name, true);
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const chartOptions = {
        maintainAspectRatio: false,
        legend: {
            position: 'bottom'
        },
        scales: {
            x: {
                type: 'category',
                labels: seasonOrder
            }
        }
    };

    if (!playerDetails.length || !chartData.datasets.length) {
        return <div>Loading player details...</div>;
    }

    return (
      <div style={{ padding: '20px' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <button onClick={handleBackToHome} style={{ padding: '10px 20px', border: '2px solid #333' }}>Home</button>
          </div>
          <h1 style={{ textAlign: 'center', fontSize: '56px', marginTop: '40px' }}>Player Details</h1>
          <button onClick={() => setIsComparing(true)} style={{ padding: '10px 20px' }}>
              Compare with another player
          </button>
          {isComparing && (
              <div>
                  <input
                      type="text"
                      id="playerSearch"
                      name="playerSearch"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search for another player"
                      autoComplete="off"
                      style={{ padding: '10px', width: '300px', marginTop: '10px' }}
                  />
                  {suggestions.length > 0 && (
                      <ul style={{
                          listStyleType: 'none',
                          padding: 0,
                          marginTop: '10px',
                          background: 'white',
                          border: '1px solid #ccc',
                          position: 'absolute',
                          width: '300px',
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
          )}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <div style={{ display: 'flex', maxWidth: '100%', width: '100%', gap: '20px' }}> 
                  <div style={{
                      width: '350px',  // Set a fixed width for the details panel
                      backgroundColor: '#f9f9f9',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      position: 'relative'
                  }}>
                      {playerDetails.map((details, index) => (
                          <div key={details.Name}>
                              <p style={{ fontSize: '24px', fontWeight: 'bold', color: marketValueColors[index % marketValueColors.length] }}>{details.Name}</p>
                              <p><strong>Position:</strong> {details.Position}</p>
                              <p><strong>Nationality:</strong> {details.Nationality}</p>
                              <p><strong>Age:</strong> {details.Age}</p>
                              <p><strong>Goals:</strong> {details.Goals}</p>
                              <p><strong>Assists:</strong> {details.Assists}</p>
                              <p><strong>Minutes Played:</strong> {details.MinutesPlayed}</p>
                              <p><strong>Yellow Cards:</strong> {details.YellowCards}</p>
                              <p><strong>Red Cards:</strong> {details.RedCards}</p>
                          </div>
                      ))}
                  </div>
                  <div style={{ flexGrow: 1, height: '700px', width: '65%'}}>
                      <Line data={chartData} options={chartOptions} />
                  </div>
              </div>
          </div>
      </div>
  );
  
};

export default PlayerDetailsPage;
