import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Headphones } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const ChatMap = ({ coords, currentNodeId, allSpots, onStartTour }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [selectedSpot, setSelectedSpot] = useState(null);

    const onMarkerClick = useCallback((spot) => {
        setSelectedSpot(spot);
    }, []);

    if (!isLoaded) return <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 font-medium">Loading Map...</div>;

    const mapCenter = coords || (allSpots[0]?.coords) || { lat: 41.8902, lng: 12.4922 };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={16}
            options={{
                disableDefaultUI: true,
                styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    }
                ]
            }}
        >
            {allSpots.map((spot) => {
                const isActive = spot.id === currentNodeId;
                return (
                    <Marker
                        key={spot.id}
                        position={spot.coords}
                        label={{
                            text: spot.id === 'intro' ? 'S' : spot.id.replace('spot_', ''),
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: isActive ? '#000000' : '#FF3B30',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#FFFFFF',
                            scale: 18,
                        }}
                        onClick={() => onMarkerClick(spot)}
                    />
                );
            })}

            {selectedSpot && (
                <InfoWindow
                    position={selectedSpot.coords}
                    onCloseClick={() => setSelectedSpot(null)}
                >
                    <div className="p-2 text-center">
                        <h4 className="font-bold text-[15px] mb-2">{selectedSpot.spotName}</h4>
                        <button
                            onClick={() => onStartTour(selectedSpot.id)}
                            className="bg-[#007AFF] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto"
                        >
                            <Headphones size={14} /> 설명 듣기
                        </button>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default ChatMap;
