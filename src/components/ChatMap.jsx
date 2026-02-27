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

const ChatMap = ({ coords, allSpots, onStartTour }) => {
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
                {allSpots?.map((spot) => (
                    <Marker
                        key={spot.id}
                        position={spot.coords}
                        onClick={() => handleMarkerClick(spot)}
                    // Highlight current spot marker if needed (optional)
                    />
                ))}

                {selectedSpot && (
                    <InfoWindow
                        position={selectedSpot.coords}
                        onCloseClick={() => setSelectedSpot(null)}
                    >
                        <div className="p-1 min-w-[120px]">
                            <h3 className="font-bold text-[14px] mb-1">{selectedSpot.spotName}</h3>
                            <button
                                onClick={() => {
                                    onStartTour(selectedSpot.id);
                                    setSelectedSpot(null);
                                }}
                                className="w-full bg-[#FEE500] text-black text-[12px] font-bold py-1.5 px-3 rounded-md hover:opacity-90 transition-opacity"
                            >
                                설명 듣기 🎧
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
