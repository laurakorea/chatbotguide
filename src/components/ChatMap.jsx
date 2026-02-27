import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const center = {
    lat: 41.8902,
    lng: 12.4922
};

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

import { Headphones } from 'lucide-react';

const getMarkerIcon = (number, isActive) => {
    const color = isActive ? "#000000" : "#FF5252";
    const svg = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26c0-8.84-7.16-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
        <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="${color}" text-anchor="middle">${number}</text>
    </svg>`;
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        anchor: typeof google !== 'undefined' ? new google.maps.Point(16, 42) : null
    };
};

const ChatMap = ({ coords, currentNodeId, allSpots, onStartTour }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Sync map center when coords change (tour progresses)
    useEffect(() => {
        if (map && coords) {
            map.panTo(coords);
        }
    }, [map, coords]);

    const handleMarkerClick = (spot) => {
        setSelectedSpot(spot);
        if (map) map.panTo(spot.coords);
    };

    return isLoaded ? (
        <div style={{ width: '100%', height: '100%' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={coords || center}
                zoom={17}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                }}
            >
                {/* Render markers for all spots */}
                {allSpots?.map((spot, index) => {
                    const isActive = spot.id === currentNodeId;
                    return (
                        <Marker
                            key={spot.id}
                            position={spot.coords}
                            onClick={() => handleMarkerClick(spot)}
                            icon={getMarkerIcon(index + 1, isActive)}
                        />
                    );
                })}

                {selectedSpot && (
                    <InfoWindow
                        position={selectedSpot.coords}
                        onCloseClick={() => setSelectedSpot(null)}
                    >
                        <div className="iw-content">
                            <h3 className="iw-title">{selectedSpot.spotName}</h3>
                            <button
                                onClick={() => {
                                    onStartTour(selectedSpot.id);
                                    setSelectedSpot(null);
                                }}
                                className="btn-listen"
                            >
                                <span className="icon-wrapper">
                                    <Headphones size={14} />
                                </span>
                                설명 듣기
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 italic text-gray-400 font-sans">
            Loading Interactive Maps...
        </div>
    );
};

export default React.memo(ChatMap);
