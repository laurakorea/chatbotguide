import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const center = {
    lat: 41.8902,
    lng: 12.4922
};

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const ChatMap = ({ coords }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = React.useState(null);

    const onLoad = React.useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Sync map center when coords change
    React.useEffect(() => {
        if (map && coords) {
            map.panTo(coords);
        }
    }, [map, coords]);

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
                {coords && <Marker position={coords} />}
            </GoogleMap>
        </div>
    ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 italic text-gray-400">
            Loading Maps...
        </div>
    );
};

export default React.memo(ChatMap);
