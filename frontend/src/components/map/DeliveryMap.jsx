import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { BiLoader } from 'react-icons/bi';
import { realtimeService } from '../../config/services';
import { VITE_INTERNAL_SERVICE_KEY } from '../../config/env';
import riderImg from '../../assets/images/riderIcon.png';
import homeImg from '../../assets/images/homeIcon.png';

const riderIcon = new L.DivIcon({
    html: `<img src='${riderImg}' class="w-full h-full bg-transparent"/>`,
    iconSize: [30, 30],
});

const deliveryIcon = new L.DivIcon({
    html: `<img src='${homeImg}' class="w-full h-full bg-transparent"/>`,
    iconSize: [30, 30],
});

const getDeliveryLocation = (order) => {
    const coords = order?.deliveryAddress?.location?.coordinates;
    if (!coords?.length) return null;
    return [coords[1], coords[0]];
};

const Routing = ({ from, to }) => {
    const map = useMap();

    useEffect(() => {
        if (!from || !to) return;

        const control = L.Routing.control({
            waypoints: [L.latLng(from), L.latLng(to)],
            lineOptions: {
                styles: [{ color: '#E23744', weight: 5 }],
            },
            addWaypoints: false,
            draggablePoints: false,
            show: false,
            createMarker: () => null,
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        }).addTo(map);

        return () => map.removeControl(control);
    }, [from, to, map]);

    return null;
};

/**
 * Shared live delivery map.
 * @param {object} order - order with deliveryAddress + userId (rider emit)
 * @param {'rider'|'customer'} role - rider tracks GPS & broadcasts; customer listens via riderLocation
 * @param {[number, number]|null} riderLocation - [lat, lng] for customer view
 */
const DeliveryMap = ({ order, role = 'rider', riderLocation: externalRiderLocation = null }) => {
    const [trackedLocation, setTrackedLocation] = useState(null);

    const deliveryLocation = useMemo(() => getDeliveryLocation(order), [order]);
    const riderLocation = role === 'rider' ? trackedLocation : externalRiderLocation;

    useEffect(() => {
        if (role !== 'rider' || !order?.userId) return;

        const publishLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setTrackedLocation([latitude, longitude]);

                    axios.post(
                        `${realtimeService}/api/v1/internal/emit`,
                        {
                            event: 'rider:location',
                            room: `user:${order.userId}`,
                            payload: { latitude, longitude, orderId: order._id },
                        },
                        {
                            headers: { 'x-internal-key': VITE_INTERNAL_SERVICE_KEY },
                        }
                    ).catch((err) => console.log('Location emit error', err));
                },
                (err) => console.log('Location error', err),
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
        };

        publishLocation();
        const interval = setInterval(publishLocation, 10000);
        return () => clearInterval(interval);
    }, [role, order?.userId, order?._id]);

    if (!deliveryLocation) return null;

    if (!riderLocation) {
        const message =
            role === 'rider'
                ? 'Loading your location...'
                : 'Waiting for rider location...';

        return (
            <div className="flex items-center justify-center h-full min-h-70 gap-2 rounded-xl bg-white shadow-sm p-3">
                <BiLoader className="w-5 h-5 text-gray-500 animate-spin" />
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        );
    }

    const riderLabel = role === 'rider' ? 'You (Rider)' : 'Rider';

    return (
        <div className="rounded-xl bg-white shadow-lg p-2 aspect-square lg:aspect-auto lg:h-full min-h-70">
            <MapContainer center={riderLocation} zoom={14} className="h-full w-full rounded-lg min-h-65">
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={riderLocation} icon={riderIcon}>
                    <Popup>{riderLabel}</Popup>
                </Marker>
                <Marker position={deliveryLocation} icon={deliveryIcon}>
                    <Popup>Delivery location</Popup>
                </Marker>
                <Routing from={riderLocation} to={deliveryLocation} />
            </MapContainer>
        </div>
    );
};

export default DeliveryMap;
