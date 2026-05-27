import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents({ actualiser }) {
  const [incidents, setIncidents] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => r.json())
      .then(data => {
        setIncidents(data);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, [actualiser]);

  if (chargement) {
    return <p className="incidents-chargement">Chargement des incidents...</p>;
  }

  if (incidents.length === 0) {
    return (
      <div className="liste-incidents">
        <h3 className="incidents-titre">Incidents signalés</h3>
        <p className="incidents-vide">Aucun incident signalé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="liste-incidents">
      <h3 className="incidents-titre">
        Incidents signalés ({incidents.length})
      </h3>
      {incidents.map(incident => (
        <div key={incident.id} className="incident-carte">
          <div className="incident-header">
            <span className="incident-ligne">Ligne {incident.ligne}</span>
            <span className="incident-id">#{incident.id}</span>
          </div>
          <p className="incident-description">{incident.description}</p>
          <p className="incident-lieu">📍 {incident.lieu}</p>
        </div>
      ))}
    </div>
  );
}

export default ListeIncidents;