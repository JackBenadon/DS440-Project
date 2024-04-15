import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const PlayerDetailsPage = () => {
  const [playerDetails, setPlayerDetails] = useState(null);
  const [chartData, setChartData] = useState({});
  const [noPredictionComment, setNoPredictionComment] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const playerName = queryParams.get('name').toLowerCase();

    const loadData = async () => {
      try {
        const responseTotal = await fetch('/total_table_two_df.csv');
        const csvDataTotal = await responseTotal.text();
        const responseMerged = await fetch('/merged_table.csv');
        const csvDataMerged = await responseMerged.text();

        const parsedTotal = Papa.parse(csvDataTotal, { header: true }).data;
        const parsedMerged = Papa.parse(csvDataMerged, { header: true }).data;

        const playerRecords = parsedTotal.filter(player => 
          player.Name.toLowerCase() === playerName
        );
        const playerPrediction = parsedMerged.find(player => 
          player.Name && player.Name.toLowerCase() === playerName && player.predictions
        );

        if (playerRecords.length > 0) {
          const latestSeasonRecord = playerRecords.reduce((latest, current) => 
            new Date(latest.date) > new Date(current.date) ? latest : current
          );
          setPlayerDetails(latestSeasonRecord);

          const seasons = playerRecords.map(record => record.Season);
          const marketValues = playerRecords.map(record => record.market_value_in_eur);
          const datasets = [{
            label: 'Market Value',
            data: marketValues,
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)',
          }];

          if (playerPrediction && seasons.includes('2023/2024')) {
            datasets.push({
              label: 'Prediction',
              data: seasons.map(season => season === '2023/2024' ? playerPrediction.predictions : null),
              backgroundColor: 'red',
              borderColor: 'red',
              pointRadius: 10,
              pointHoverRadius: 15,
              showLine: false
            });
          } else {
            setNoPredictionComment('No data available for them playing the current season.');
          }

          setChartData({
            labels: seasons,
            datasets: datasets
          });
        } else {
          setNoPredictionComment('No data available for this player.');
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setNoPredictionComment('Failed to load player data due to an error.');
      }
    };

    loadData();
  }, [location.search]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!playerDetails || !chartData) {
    return <div>Loading player details...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={handleBackToHome} style={{
          padding: '10px 20px',
          border: '2px solid #333'
        }}>Home</button>
      </div>
      <h1 style={{ textAlign: 'center', fontSize: '56px', marginTop: '40px' }}>Player Details</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ display: 'flex', maxWidth: '1200px', width: '100%', gap: '20px' }}>
          <div style={{
            flex: '1',
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: '36px', color: 'dodgerblue', marginBottom: '10px' }}>{playerDetails.Name}</h2>
            <p><strong>Position:</strong> {playerDetails.Position}</p>
            <p><strong>Nationality:</strong> {playerDetails.Nationality}</p>
            <p><strong>Age:</strong> {playerDetails.Age}</p>
            <p><strong>Goals:</strong> {playerDetails.Goals}</p>
            <p><strong>Assists:</strong> {playerDetails.Assists}</p>
            <p><strong>Minutes Played:</strong> {playerDetails.MinutesPlayed}</p>
            <p><strong>Yellow Cards:</strong> {playerDetails.YellowCards}</p>
            <p><strong>Red Cards:</strong> {playerDetails.RedCards}</p>
          </div>
          <div style={{ flex: '1', height: '400px', width: '600px' }}>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
            {noPredictionComment && <p style={{ color: 'red', marginTop: '10px' }}>{noPredictionComment}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;
