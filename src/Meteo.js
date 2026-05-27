import { useState, useEffect } from 'react';
import './Meteo.css';

function Meteo() {
  const [meteo, setMeteo] = useState(null);
  const [previsions, setPrevisions] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const API_KEY = process.env.REACT_APP_OWM_KEY;
    if (!API_KEY) {
      setErreur("Clé API manquante (.env)");
      return;
    }

    // Météo actuelle
    const urlActuelle =
      `https://api.openweathermap.org/data/2.5/weather`
      + `?q=Dakar&appid=${API_KEY}`
      + `&units=metric&lang=fr`;

    fetch(urlActuelle)
      .then(r => {
        if (!r.ok) throw new Error("Erreur : " + r.status);
        return r.json();
      })
      .then(data => {
        setMeteo({
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          condition: data.weather[0].main,
          humidite: data.main.humidity,
          icone: data.weather[0].icon,
        });
      })
      .catch(err => setErreur(err.message));

    // Prévisions 5 jours
    const urlPrevisions =
      `https://api.openweathermap.org/data/2.5/forecast`
      + `?q=Dakar&appid=${API_KEY}`
      + `&units=metric&lang=fr`;

    fetch(urlPrevisions)
      .then(r => r.json())
      .then(data => {
        // Un relevé toutes les 3h → on prend un par jour à midi
        const parJour = {};
        data.list.forEach(item => {
          const date = item.dt_txt.split(" ")[0];
          if (!parJour[date] && item.dt_txt.includes("12:00:00")) {
            parJour[date] = {
              date,
              temperature: Math.round(item.main.temp),
              description: item.weather[0].description,
              icone: item.weather[0].icon,
            };
          }
        });
        setPrevisions(Object.values(parJour).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  function getAlerte(condition) {
    if (condition === "Rain" || condition === "Drizzle") {
      return {
        message: "Pluie détectée - risque de retards",
        classe: "alerte-pluie"
      };
    }
    if (condition === "Thunderstorm") {
      return {
        message: "Orage en cours - soyez prudents",
        classe: "alerte-orage"
      };
    }
    return null;
  }

  if (erreur) {
    return (
      <div className="meteo meteo-erreur">
        <p>Météo indisponible</p>
        <p className="meteo-detail">{erreur}</p>
      </div>
    );
  }

  if (!meteo) {
    return <div className="meteo">Chargement météo...</div>;
  }

  const alerte = getAlerte(meteo.condition);

  return (
    <div className="meteo">
      <div className="meteo-info">
        <img
          src={`https://openweathermap.org/img/wn/${meteo.icone}@2x.png`}
          alt={meteo.description}
          className="meteo-icone"
        />
        <div>
          <span className="meteo-temp">{meteo.temperature}&deg; C</span>
          <span className="meteo-desc">{meteo.description}</span>
        </div>
        <span className="meteo-humidite">
          Humidité : {meteo.humidite}%
        </span>
      </div>
      {alerte && (
        <div className={`meteo-alerte ${alerte.classe}`}>
          {alerte.message}
        </div>
      )}
      {previsions.length > 0 && (
        <div className="previsions">
          <h4 className="previsions-titre">Prévisions 3 jours</h4>
          <div className="previsions-liste">
            {previsions.map(p => (
              <div key={p.date} className="prevision-carte">
                <span className="prevision-date">
                  {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${p.icone}.png`}
                  alt={p.description}
                  className="prevision-icone"
                />
                <span className="prevision-temp">{p.temperature}°C</span>
                <span className="prevision-desc">{p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Meteo;