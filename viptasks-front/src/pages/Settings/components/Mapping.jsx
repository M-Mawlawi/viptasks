import React, { useState, useEffect, useRef } from "react";

import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf"; // Import turf.js
import apiService from "../../../services/api";
import wellknown from "wellknown";

// Geocode a city name or address
const geocodeCity = async (cityName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

function MappingComponent() {
  const [cityName, setCityName] = useState("");
  const [highlightedShape, setHighlightedShape] = useState([]);
  const [highlightedCity, setHighlightedCity] = useState(null);
  const [isCityInsidePolygon, setIsCityInsidePolygon] = useState(false);

  const handleCitySearch = async () => {
    const data = await geocodeCity(cityName);
  
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      setHighlightedCity(coordinates);
  
      // Check if the city is inside the highlighted polygon
      if (highlightedShape.length > 0) {
        const polygon = [...highlightedShape, highlightedShape[0]]; // Add the first point at the end to close the polygon
        const cityInsidePolygon = isPointInsidePolygon(coordinates, polygon);
        setIsCityInsidePolygon(cityInsidePolygon);
      }
    } else {
      console.error("City not found");
    }
  };
  
  const handleDrawCreated = (e) => {
    const { layerType, layer } = e;

    if (layerType === "polygon") {
      // Create a unique identifier for the new polygon
      const id = `polygon-${Date.now()}`;
      const coordinates = layer.getLatLngs()[0].map((coord) => ({
        lat: coord.lat,
        lng: coord.lng,
      }));

      // Check if there are enough points to form a valid polygon
      if (coordinates.length >= 3) {
        // Add the first point at the end to close the polygon
        const polygon = { id, coordinates: [...coordinates, coordinates[0]] };
        setHighlightedShapes((prevShapes) => [...prevShapes, polygon]);
        // Check if the city is inside the newly highlighted polygon
        if (highlightedCity) {
          const cityInsidePolygon = isPointInsidePolygon(highlightedCity, polygon.coordinates);
          setIsCityInsidePolygon(cityInsidePolygon);
        }
      } else {
        console.error("Not enough points to form a valid polygon");
      }
    }
  };

  const handleDeletePolygon = (id) => {
    // Remove the specified polygon based on its unique identifier
    setHighlightedShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id));
  };
  
  const getAreas = async () => {
    try {
      const areasData = await apiService.getAreas();
      const parsedAreas = parseMultiPolygon(areasData.highlighted_area);
      // Generate unique identifiers for each polygon
      const polygonsWithIds = parsedAreas.map((polygon) => ({
        id: `polygon-${Date.now()}`,
        coordinates: polygon,
      }));
      setHighlightedShapes((prevShapes) => [...prevShapes, ...polygonsWithIds]);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const parseMultiPolygon = (multiPolygonString) => {
    const geojson = wellknown.parse(multiPolygonString);
    if (geojson && geojson.type === "MultiPolygon") {
      return geojson.coordinates.map((polygon) =>
        polygon.map((ring) =>
          ring.map(([lng, lat]) => ({ lat, lng }))
        )
      );
    }
    return [];
  };

useEffect(() => {
  getAreas();
}, []);

return (
  <div>
    <input
      type="text"
      placeholder="Enter city name"
      onChange={(e) => setCityName(e.target.value)}
    />
    <button onClick={handleCitySearch}>Search</button>
    <MapContainer center={[0, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {highlightedShapes.map((polygon) => (
        <React.Fragment key={polygon.id}>
          <Polygon positions={polygon.coordinates} color="green" />
          <button onClick={() => handleDeletePolygon(polygon.id)}>Delete Polygon</button>
        </React.Fragment>
      ))}
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleDrawCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>
      {highlightedCity && (
        <Marker position={highlightedCity}>
          <Popup>Highlighted City</Popup>
        </Marker>
      )}
    </MapContainer>
    {isCityInsidePolygon && <p>The highlighted city is inside the highlighted area.</p>}
    <button onClick={handleSaveHighlight}>Save Highlight</button>
  </div>
);
}

export default MappingComponent;